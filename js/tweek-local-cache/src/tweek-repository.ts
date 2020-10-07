import { Context, GetValuesConfig, ITweekClient } from 'tweek-client';
import { createChangeEmitter } from 'change-emitter';
import isEqual from 'lodash.isequal';
import $$observable from 'symbol-observable';
import Observable from 'zen-observable';
import Trie from './trie';
import {
  delay,
  deprecated,
  distinct,
  flatMap,
  getAllPrefixes,
  getKeyPrefix,
  getValueOrOptional,
  isScanKey,
  once,
  partitionByIndex,
  snakeToCamelCase,
} from './utils';
import Optional from './optional';
import MemoryStore from './memory-store';
import {
  Expiration,
  FlatKeys,
  ITweekStore,
  RefreshErrorPolicy,
  RepositoryKey,
  RepositoryKeyState,
  StoredKey,
  TweekRepositoryConfig,
} from './types';
import exponentIntervalFailurePolicy from './exponent-refresh-error-policy';
import * as StoredKeyUtils from './stored-key-utils';
import { TweekKeySplitJoin } from './split-join';

type KeyValues = { [key: string]: unknown };

export type Unlisten = () => void;
export type RepositoryListener = (updatedKeys: Set<string>) => void;
export type Listen = (listen: RepositoryListener) => Unlisten;

const allowedKeyStates = new Set([RepositoryKeyState.requested, RepositoryKeyState.cached, RepositoryKeyState.missing]);

export class TweekRepository {
  private _emitter = createChangeEmitter<Set<string>>();
  private _cache = new Trie<StoredKey<unknown>>(TweekKeySplitJoin);
  private _store: ITweekStore;
  private _client: ITweekClient;
  private _context: Context;
  private _refreshDelay: number;
  private _isDirty = false;
  private _retryCount = 0;

  private _refreshInProgress = false;
  private _refreshErrorPolicy: RefreshErrorPolicy;
  private _refreshPromise = Promise.resolve();

  constructor({
    client,
    refreshDelay,
    refreshErrorPolicy = exponentIntervalFailurePolicy(),
    context = {},
  }: TweekRepositoryConfig) {
    this._client = client;
    this._store = new MemoryStore();
    this._refreshDelay = refreshDelay || 30;
    this._refreshErrorPolicy = refreshErrorPolicy;
    this._context = context;
  }

  public updateContext(valueOrMapper: Context | ((context: Context) => Context | null)) {
    if (typeof valueOrMapper === 'function') {
      valueOrMapper = <Context>valueOrMapper(this._context);
      if (!valueOrMapper) {
        return;
      }
    }
    this.waitRefreshCycle().then(() => {
      this._context = <Context>valueOrMapper;
      this.expire();
    });
  }

  public addKeys(keys: FlatKeys) {
    const updatedKeys: string[] = [];

    Object.entries(keys).forEach(([key, value]) => {
      if (this._updateNode(key, value)) {
        updatedKeys.push(key);
      }
    });

    this._emit(updatedKeys);
  }

  public useStore(store: ITweekStore) {
    this._store = store;

    return this._store.load().then((keys) => {
      keys = keys || {};
      const entries = Object.entries(keys);

      for (const [key, value] of entries) {
        if (!allowedKeyStates.has(value.state) || isScanKey(key) !== value.isScan) {
          throw new Error('stored cache is corrupted. not loading');
        }
      }

      const updatedKeys: string[] = [];

      for (let [key, value] of entries) {
        if (value.expiration) {
          this._isDirty = true;
          this._checkRefresh();
          value = StoredKeyUtils.expire(value);
        }

        if (!value.isScan && value.state !== RepositoryKeyState.requested) {
          const cached = this._cache.get(key);
          if (!cached || !isEqual(cached.value, value.value)) {
            updatedKeys.push(key);
          }
        }

        this._cache.set(key, value);
      }

      this._emit(updatedKeys);
    });
  }

  public prepare(key: string) {
    const node = this._cache.get(key);
    if (!node) {
      const isScan = isScanKey(key);
      this._cache.set(key, StoredKeyUtils.request(isScan));
      this._isDirty = true;
      this._checkRefresh();
    }
  }

  /**
   * @deprecated Please use `getValue`
   */
  @deprecated('getValue')
  public get<T = any>(key: string): Promise<Optional<T> | T> {
    const cached = this.getCached(key);

    if (!cached) {
      this.prepare(key);
    } else if (cached.state !== RepositoryKeyState.requested) {
      return Promise.resolve(getValueOrOptional(cached));
    }

    return new Promise<T>((resolve, reject) => {
      const unlisten = this.listen((updatedKeys) => {
        if (updatedKeys.has(key)) {
          unlisten();
          const cached = this.getCached(key);
          if (!cached || cached.state === RepositoryKeyState.requested) {
            reject(new Error('repository state is corrupted'));
          } else {
            resolve(getValueOrOptional(cached));
          }
        }
      });
    });
  }

  public getValue<T = any>(key: string): Promise<T> {
    const cached = this.getCached(key);

    if (!cached) {
      this.prepare(key);
    } else if (cached.state !== RepositoryKeyState.requested) {
      return Promise.resolve(cached.value);
    }

    return new Promise<T>((resolve, reject) => {
      const unlisten = this.listen((updatedKeys) => {
        if (updatedKeys.has(key)) {
          unlisten();
          const cached = this.getCached(key);
          if (!cached || cached.state === RepositoryKeyState.requested) {
            reject(new Error('repository state is corrupted'));
          } else {
            resolve(cached.value);
          }
        }
      });
    });
  }

  /**
   * @deprecated Please use `expire`
   */
  @deprecated('expire')
  public refresh(keysToRefresh?: string[]) {
    this.expire(keysToRefresh);
  }

  public expire(keysToRefresh = Object.keys(this._cache.list())) {
    for (const key of keysToRefresh) {
      const node = this._cache.get(key);

      if (!node) {
        this.prepare(key);
        continue;
      }

      if (node.expiration !== Expiration.refreshing) {
        this._isDirty = true;
        if (node.expiration !== Expiration.expired) {
          this._cache.set(key, StoredKeyUtils.expire(node));
        }
      }
    }
    this._checkRefresh();
  }

  /**
   * @deprecated Please use `observeValue`
   */
  @deprecated('observeValue')
  public observe<T = any>(key: string): Observable<T> {
    const isScan = isScanKey(key);

    return new Observable<any>((observer) => {
      const onKey = () => {
        const cached = this.getCached(key);

        if (!cached) {
          this.prepare(key);
          return;
        }

        if (isScan !== cached.isScan) {
          observer.error(new Error('corrupted cache'));
          return;
        }

        if (cached.state === RepositoryKeyState.cached) {
          observer.next(isScan ? cached.value : Optional.some(cached.value));
          return;
        }

        if (cached.state === RepositoryKeyState.missing) {
          observer.next(Optional.none());
        }
      };

      onKey();

      return this.listen((updatedKeys) => {
        if (!updatedKeys.has(key)) {
          return;
        }

        onKey();
      });
    });
  }

  public observeValue<T = any>(key: string): Observable<T> {
    return new Observable<any>((observer) => {
      const onKey = () => {
        const cached = this.getCached(key);

        if (!cached) {
          this.prepare(key);
          return;
        }

        if (cached.state === RepositoryKeyState.requested) {
          return;
        }

        observer.next(cached.value);
      };

      onKey();

      return this.listen((updatedKeys) => {
        if (!updatedKeys.has(key)) {
          return;
        }

        onKey();
      });
    });
  }

  public getCached<T = any>(key: string): RepositoryKey<T> | undefined {
    const node = this._cache.get(key);
    if (!node) {
      return undefined;
    }

    let { state, isScan, value } = node;

    if (state === RepositoryKeyState.cached && isScan) {
      const prefix = getKeyPrefix(key);
      const relative = Object.values(this._cache.list(prefix));
      if (relative.some((v) => !v.isScan && v.state === RepositoryKeyState.requested)) {
        state = RepositoryKeyState.requested;
        value = undefined;
      } else {
        value = this._extractScanResult(key);
      }
    }

    return <RepositoryKey<T>>{
      state,
      isScan,
      value,
    };
  }

  public listen: Listen = this._emitter.listen;

  public [$$observable]() {
    return this.observeValue('_');
  }

  public waitRefreshCycle() {
    if (!this._refreshInProgress) return Promise.resolve();
    return this._refreshPromise;
  }

  public invalidate(keysToInvalidate = Object.keys(this._cache.list())) {
    for (const key of keysToInvalidate) {
      const isScan = isScanKey(key);
      this._cache.set(key, StoredKeyUtils.request(isScan));
    }

    this._isDirty = true;
    this._checkRefresh();
  }

  private _checkRefresh() {
    this._refreshPromise = this._refreshInProgress
      ? this._refreshPromise.then(() => {
          if (!this._refreshInProgress) return this._rollRefresh();
          return;
        })
      : this._rollRefresh();
  }

  private _rollRefresh(): Promise<void> {
    if (!this._isDirty) {
      this._refreshInProgress = false;
      return Promise.resolve();
    }
    this._refreshInProgress = true;

    return (this._retryCount === 0 ? delay(this._refreshDelay) : Promise.resolve())
      .then(() => this._refreshKeys())
      .then(() => {
        this._refreshInProgress = false;
        this._retryCount = 0;
      })
      .catch((ex) => {
        this._refreshErrorPolicy(
          once(() => {
            this._rollRefresh();
          }),
          ++this._retryCount,
          ex,
        );
      });
  }

  private _refreshKeys() {
    if (!this._isDirty) return Promise.resolve();
    this._isDirty = false;

    const expiredKeys = Object.entries(this._cache.list()).filter(
      ([_, valueNode]) =>
        valueNode.state === RepositoryKeyState.requested || valueNode.expiration === Expiration.expired,
    );

    if (expiredKeys.length === 0) return Promise.resolve();

    expiredKeys.forEach(([key, valueNode]) => this._cache.set(key, StoredKeyUtils.refresh(valueNode)));

    const keysToRefresh = expiredKeys.map(([key]) => key);

    const fetchConfig: GetValuesConfig = {
      flatten: true,
      // @ts-ignore legacy support
      casing: 'snake',
      context: this._context,
      include: keysToRefresh,
    };

    return this._getValues(fetchConfig)
      .catch((err) => {
        expiredKeys.forEach(([key, valueNode]) => this._cache.set(key, StoredKeyUtils.expire(valueNode)));
        this._isDirty = true;
        throw err;
      })
      .then((keyValues) => this._updateTrieKeys(keysToRefresh, keyValues))
      .then((updatedKeys) => this._store.save(this._cache.list()).then(() => this._emit(updatedKeys)));
  }

  private _updateTrieKeys(keys: string[], keyValues: KeyValues): string[] {
    let valuesTrie: Trie<unknown> | undefined;
    const updatedKeys = [];
    for (const keyToUpdate of keys) {
      const isScan = isScanKey(keyToUpdate);
      if (isScan) {
        if (!valuesTrie) {
          valuesTrie = Trie.from(TweekKeySplitJoin, keyValues);
        }
        Array.prototype.push.apply(updatedKeys, this._updateTrieScanKey(keyToUpdate, keyValues, valuesTrie));
      } else if (this._updateNode(keyToUpdate, keyValues[keyToUpdate])) {
        updatedKeys.push(keyToUpdate);
      }
    }
    return updatedKeys;
  }

  private _updateTrieScanKey(key: string, keyValues: KeyValues, valuesTrie: Trie<unknown>): string[] {
    this._cache.set(key, StoredKeyUtils.cached(true));

    const prefix = getKeyPrefix(key);
    const updatedKeys: string[] = [];

    const keysToUpdate = distinct(this._cache.listEntries(prefix).concat(valuesTrie.listEntries(prefix)));

    keysToUpdate.forEach((subKey) => {
      if (isScanKey(subKey)) {
        this._cache.set(subKey, StoredKeyUtils.cached(true));

        const fullPrefix = getKeyPrefix(subKey);
        const entries = valuesTrie.listEntries(fullPrefix);

        this._setScanNodes(entries);
      } else if (this._updateNode(subKey, keyValues[subKey])) {
        updatedKeys.push(subKey);
      }
    });

    return updatedKeys;
  }

  private _setScanNodes(keys: string[]) {
    distinct(flatMap(keys, (key) => getAllPrefixes(key)))
      .map((path) => `${path}/_`)
      .filter((path) => !this._cache.get(path))
      .forEach((key) => this._cache.set(key, StoredKeyUtils.cached(true)));
  }

  private _updateNode(key: string, value: unknown): boolean {
    const cached = this._cache.get(key);
    const updated = !cached || cached.state === RepositoryKeyState.requested || !isEqual(cached.value, value);

    if (value === undefined) {
      this._cache.set(key, StoredKeyUtils.missing());
    } else {
      this._cache.set(key, StoredKeyUtils.cached(false, value));
    }

    return updated;
  }

  private _extractScanResult(key: string) {
    const prefix = getKeyPrefix(key);

    const result = {};

    for (const [key, valueNode] of Object.entries(this._cache.listRelative(prefix))) {
      if (valueNode.isScan || valueNode.state !== RepositoryKeyState.cached) {
        continue;
      }

      const [fragments, [name]] = partitionByIndex(TweekKeySplitJoin.split(key).map(snakeToCamelCase), -1);
      let node: any = result;
      for (const fragment of fragments) {
        if (!(fragment in node)) {
          node[fragment] = {};
        }
        node = node[fragment];
      }
      node[name] = valueNode.value;
    }

    return result;
  }

  private _emit(keys: string[]) {
    if (!keys.length) {
      return;
    }

    const relative = flatMap(keys, (k) => getAllPrefixes(k).map((scan) => `${scan}/_`));
    const affectedKeys = new Set(keys.concat(relative));
    affectedKeys.add('_');

    this._emitter.emit(affectedKeys);
  }

  private _getValues(fetchConfig: GetValuesConfig) {
    // check if using an older version of the client
    if (this._client.getValues) {
      return this._client.getValues<KeyValues>('_', fetchConfig);
    }

    return this._client.fetch<KeyValues>('_', fetchConfig);
  }
}

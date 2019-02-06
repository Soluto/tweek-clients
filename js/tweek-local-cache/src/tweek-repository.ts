import { Context, GetValuesConfig, ITweekClient } from 'tweek-client';
import { createChangeEmitter } from 'change-emitter';
import $$observable from 'symbol-observable';
import Observable from 'zen-observable';
import Trie from './trie';
import {
  delay,
  distinct,
  flatMap,
  getAllPrefixes,
  getKeyPrefix,
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
  StoredKey,
  ITweekStore,
  RefreshErrorPolicy,
  RepositoryKeyState,
  TweekRepositoryConfig,
  CachedSingleKey,
  RepositoryKey,
} from './types';
import exponentIntervalFailurePolicy from './exponent-refresh-error-policy';
import * as StoredKeyUtils from './stored-key-utils';

export const TweekKeySplitJoin = {
  split: (key: string) => {
    return key.toLowerCase().split('/');
  },
  join: (fragments: string[]) => fragments.join('/'),
};

type KeyValues = { [key: string]: any };

export default class TweekRepository {
  private _emitter = createChangeEmitter<string[]>();
  private _cache = new Trie<StoredKey<any>>(TweekKeySplitJoin);
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
    this._waitRefreshCycle().then(() => {
      this._context = <Context>valueOrMapper;
      this.expire();
    });
  }

  public addKeys(keys: FlatKeys) {
    Object.entries(keys).forEach(([key, value]) => this._cache.set(key, StoredKeyUtils.cached(false, value)));
    this._emitter.emit(Object.keys(keys));
  }

  public useStore(store: ITweekStore) {
    this._store = store;
    const storedKeys: string[] = [];
    return this._store
      .load()
      .then(keys => {
        keys = keys || {};
        Object.entries(keys).forEach(([key, value]: [string, StoredKey<any>]) => {
          if (value.expiration) {
            this._isDirty = true;
            this._checkRefresh();
            value = StoredKeyUtils.expire(value);
          }
          this._cache.set(key, value);
          storedKeys.push(key);
        });
      })
      .then(() => this._emitter.emit(storedKeys));
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

  public get<T = any>(key: string): Promise<never | Optional<T> | T>;
  public get(key: string): Promise<never | Optional<any> | any> {
    return new Promise((resolve, reject) => {
      const observer = this.observe(key);
      const subscription = observer.subscribe(
        value => {
          subscription.unsubscribe();
          resolve(value);
        },
        error => {
          subscription.unsubscribe();
          reject(error);
        },
      );
    });
  }

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

  public observe<T = any>(key: string): Observable<T>;
  public observe(key: string) {
    const isScan = isScanKey(key);
    const prefixes = getAllPrefixes(key).map(k => `${k}/_`);
    const prefix = key.substr(0, key.length - 1);

    const self = this;

    return new Observable<any>(observer => {
      function onKey() {
        const cached = self.getCached(key);

        if (!cached) {
          self.prepare(key);
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
      }

      onKey();

      return self.listen(updatedKeys => {
        const keysSet = new Set(updatedKeys);
        if (
          !keysSet.has(key) &&
          !prefixes.some(p => keysSet.has(p)) &&
          (!isScan || !updatedKeys.some(k => k.startsWith(prefix)))
        ) {
          return;
        }

        onKey();
      });
    });
  }

  public getCached<T = any>(key: string): RepositoryKey<T> | undefined;
  public getCached(key: string): RepositoryKey<any> | undefined {
    const node = this._cache.get(key);
    if (!node) {
      return undefined;
    }

    let { state, isScan = false, value } = node;

    if (state === RepositoryKeyState.cached && isScan) {
      const prefix = getKeyPrefix(key);
      const relative = Object.entries(this._cache.listRelative(prefix));
      if (relative.some(([_, v]) => v.state === RepositoryKeyState.requested && !v.isScan)) {
        state = RepositoryKeyState.requested;
        value = undefined;
      } else {
        value = this._extractScanResult(key);
      }
    }

    return <RepositoryKey<any>>{
      state,
      isScan,
      value,
    };
  }

  public listen = this._emitter.listen;

  public [$$observable]() {
    return this.observe('_');
  }

  private _waitRefreshCycle() {
    if (!this._refreshInProgress) return Promise.resolve();
    return this._refreshPromise;
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
      .catch(ex => {
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

    return this._client
      .fetch<any>('_', fetchConfig)
      .catch(err => {
        expiredKeys.forEach(([key, valueNode]) => this._cache.set(key, StoredKeyUtils.expire(valueNode)));
        this._isDirty = true;
        throw err;
      })
      .then(keyValues => this._updateTrieKeys(keysToRefresh, keyValues))
      .then(() => this._store.save(this._cache.list()))
      .then(() => this._emitter.emit(keysToRefresh));
  }

  private _updateTrieKeys(keys: string[], keyValues: KeyValues) {
    let valuesTrie: Trie<any> | undefined;
    for (const keyToUpdate of keys) {
      const isScan = isScanKey(keyToUpdate);
      if (isScan) {
        if (!valuesTrie) {
          valuesTrie = Trie.from(TweekKeySplitJoin, keyValues);
        }
        this._updateTrieScanKey(keyToUpdate, keyValues, valuesTrie);
      } else {
        this._updateNode(keyToUpdate, keyValues[keyToUpdate]);
      }
    }
  }

  private _updateTrieScanKey(key: string, keyValues: KeyValues, valuesTrie: Trie<any>) {
    const prefix = getKeyPrefix(key);

    const entries = Object.entries(this._cache.list(prefix));
    entries.forEach(([subKey, valueNode]) => {
      if (!valueNode.isScan) {
        this._updateNode(subKey, keyValues[subKey]);
        return;
      }

      this._cache.set(subKey, StoredKeyUtils.cached(true));

      const fullPrefix = getKeyPrefix(subKey);
      const nodes = fullPrefix ? valuesTrie.listRelative(fullPrefix) : valuesTrie.list();

      this._setScanNodes(fullPrefix, Object.keys(nodes));

      Object.entries(nodes).forEach(([n, value]) => {
        const fullKey = fullPrefix ? `${fullPrefix}/${n}` : n;
        this._cache.set(fullKey, StoredKeyUtils.cached(false, value));
      });
    });
  }

  private _extractScanResult(key: string) {
    const prefix = getKeyPrefix(key);

    return Object.entries(this._cache.listRelative(prefix))
      .filter(([_, valueNode]) => valueNode.state === RepositoryKeyState.cached && !valueNode.isScan)
      .reduce((acc, [key, valueNode]) => {
        const [fragments, [name]] = partitionByIndex(key.split('/').map(snakeToCamelCase), -1);
        const node = fragments.reduce((x: KeyValues, fragment) => {
          if (!x[fragment]) {
            x[fragment] = {};
          }
          return x[fragment];
        }, acc);
        node[name] = (<CachedSingleKey<any>>valueNode).value;
        return acc;
      }, {});
  }

  private _setScanNodes(prefix: string, keys: string[]) {
    distinct(flatMap(keys, key => getAllPrefixes(key)))
      .map(path => (prefix ? `${prefix}/` : '') + `${path}/_`)
      .forEach(key => this._cache.set(key, StoredKeyUtils.cached(true)));
  }

  private _updateNode(key: string, value: any) {
    if (value === undefined) {
      this._cache.set(key, StoredKeyUtils.missing());
    } else {
      this._cache.set(key, StoredKeyUtils.cached(false, value));
    }
  }
}

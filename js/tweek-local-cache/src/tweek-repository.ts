import { Context, FetchConfig, ITweekClient, TweekCasing } from 'tweek-client';
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
  isNullOrUndefined,
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
  GetPolicy,
  IRepositoryKey,
  ITweekStore,
  NotPreparedPolicy,
  NotReadyPolicy,
  RefreshErrorPolicy,
  RepositoryKeyState,
  TweekRepositoryConfig,
} from './types';
import exponentIntervalFailurePolicy from './exponent-refresh-error-policy';
import * as RepositoryKey from './repository-key';

export const TweekKeySplitJoin = {
  split: (key: string) => {
    return key.toLowerCase().split('/');
  },
  join: (fragments: string[]) => fragments.join('/'),
};

type KeyValues = { [key: string]: any };

export default class TweekRepository {
  private _emitter = createChangeEmitter();
  private _cache = new Trie<IRepositoryKey<any>>(TweekKeySplitJoin);
  private _store: ITweekStore;
  private _client: ITweekClient;
  private _context: Context;
  private _getPolicy: GetPolicy;
  private _refreshDelay: number;
  private _isDirty = false;
  private _retryCount = 0;

  private _refreshInProgress = false;
  private _refreshErrorPolicy: RefreshErrorPolicy;
  private _refreshPromise = Promise.resolve();

  constructor({
    client,
    getPolicy,
    refreshDelay,
    refreshErrorPolicy = exponentIntervalFailurePolicy(),
    context = {},
  }: TweekRepositoryConfig) {
    this._client = client;
    this._store = new MemoryStore();
    this._getPolicy = {
      notReady: NotReadyPolicy.wait,
      notPrepared: NotPreparedPolicy.prepare,
      ...TweekRepository._ensurePolicy(getPolicy),
    };
    this._refreshDelay = refreshDelay || 30;
    this._refreshErrorPolicy = refreshErrorPolicy;
    this._context = context;
  }

  public updateContext(valueOrMapper: Context | ((context: Context) => Context | null)) {
    if (typeof valueOrMapper === 'function') {
      const newContext = valueOrMapper(this._context);
      if (!newContext) {
        return;
      }
      this._context = newContext;
    } else {
      this._context = valueOrMapper;
    }
    this.expire();
  }

  public addKeys(keys: FlatKeys) {
    Object.entries(keys).forEach(([key, value]) => this._cache.set(key, RepositoryKey.cached(false, value)));
    this._emitter.emit();
  }

  public useStore(store: ITweekStore) {
    this._store = store;
    return this._store
      .load()
      .then(keys => {
        keys = keys || {};
        Object.entries(keys).forEach(([key, value]: [string, IRepositoryKey<any>]) => {
          if (value.expiration) {
            this._isDirty = true;
            this._checkRefresh();
            value = RepositoryKey.expire(value);
          }
          this._cache.set(key, value);
        });
      })
      .then(() => this._emitter.emit());
  }

  public prepare(key: string) {
    const node = this._cache.get(key);
    if (!node) {
      const isScan = isScanKey(key);
      this._cache.set(key, RepositoryKey.request(isScan));
      this._isDirty = true;
      this._checkRefresh();
    }
  }

  public get<T = any>(key: string, policy?: GetPolicy): Promise<never | Optional<T> | T>;
  public get(key: string, policy?: GetPolicy): Promise<never | Optional<any> | any> {
    return new Promise((resolve, reject) => {
      const observer = this.observe(key, policy);
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
        if (this._getPolicy.notPrepared === NotPreparedPolicy.throw) {
          throw new Error(`key ${key} not managed, use prepare to add it to cache`);
        }

        this.prepare(key);
        continue;
      }

      if (node.expiration !== Expiration.refreshing) {
        this._isDirty = true;
        if (node.expiration !== Expiration.expired) {
          this._cache.set(key, RepositoryKey.expire(node));
        }
      }
    }
    this._checkRefresh();
  }

  public observe<T = any>(key: string, policy?: GetPolicy): Observable<T>;
  public observe(key: string, policy: GetPolicy = {}) {
    policy = { ...this._getPolicy, ...TweekRepository._ensurePolicy(policy) };
    const isScan = isScanKey(key);
    const self = this;
    return new Observable<any>(observer => {
      function handleNotReady() {
        switch (policy.notReady) {
          case NotReadyPolicy.wait:
            return self.expire([key]);
          default:
            return observer.error(new Error(`value not available yet for key: ${key}`));
        }
      }

      function onKey() {
        const node = self._cache.get(key);

        if (!node) {
          if (policy.notPrepared === NotPreparedPolicy.prepare) return self.prepare(key);
          return observer.error(new Error(`key ${key} not managed, use prepare to add it to cache`));
        }

        if (isScan) {
          const prefix = getKeyPrefix(key);
          const relative = Object.entries(self._cache.listRelative(prefix));
          if (
            node.state === RepositoryKeyState.requested ||
            relative.some(([_, value]) => value.state === RepositoryKeyState.requested && !value.isScan)
          ) {
            return handleNotReady();
          }
          return observer.next(self._extractScanResult(key));
        }

        if (node.state === RepositoryKeyState.requested) return handleNotReady();
        if (node.state === RepositoryKeyState.missing) return observer.next(Optional.none());
        if (node.isScan) return observer.error(new Error('corrupted cache'));
        return observer.next(Optional.some(node.value));
      }

      onKey();

      return self._emitter.listen(onKey);
    });
  }

  public [$$observable]() {
    return this.observe('_');
  }

  // @ts-ignore TS6133 (for testing purposes)
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

    const promise = (this._retryCount === 0 ? delay(this._refreshDelay) : Promise.resolve())
      .then(() => this._refreshKeys())
      .then(() => {
        this._refreshInProgress = false;
        this._retryCount = 0;
      });

    promise.catch(ex => {
      this._refreshErrorPolicy(
        once(() => {
          this._rollRefresh();
        }),
        ++this._retryCount,
        ex,
      );
    });

    return promise.catch(_ => {});
  }

  private _refreshKeys() {
    if (!this._isDirty) return Promise.resolve();
    this._isDirty = false;

    const expiredKeys = Object.entries(this._cache.list()).filter(
      ([_, valueNode]) =>
        valueNode.state === RepositoryKeyState.requested || valueNode.expiration === Expiration.expired,
    );

    if (expiredKeys.length === 0) return Promise.resolve();

    expiredKeys.forEach(([key, valueNode]) => this._cache.set(key, RepositoryKey.refresh(valueNode)));

    const keysToRefresh = expiredKeys.map(([key]) => key);

    const fetchConfig: FetchConfig = {
      flatten: true,
      casing: TweekCasing.snake,
      context: this._context,
      include: keysToRefresh,
    };

    return this._client
      .fetch<any>('_', fetchConfig)
      .catch(err => {
        expiredKeys.forEach(([key, valueNode]) => this._cache.set(key, RepositoryKey.expire(valueNode)));
        this._isDirty = true;
        throw err;
      })
      .then(keyValues => this._updateTrieKeys(keysToRefresh, keyValues))
      .then(() => this._store.save(this._cache.list()))
      .then(() => this._emitter.emit());
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
      if (valueNode.state === RepositoryKeyState.missing || !valueNode.isScan) {
        this._updateNode(subKey, keyValues[subKey]);
        return;
      }

      this._cache.set(subKey, RepositoryKey.cached(true));

      const fullPrefix = getKeyPrefix(subKey);
      const nodes = fullPrefix === '' ? valuesTrie.list() : valuesTrie.listRelative(fullPrefix);

      this._setScanNodes(fullPrefix, Object.keys(nodes));

      Object.entries(nodes).forEach(([n, value]) => {
        const fullKey = [...(fullPrefix === '' ? [] : [fullPrefix]), n].join('/');
        this._cache.set(fullKey, RepositoryKey.cached(false, value));
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
        node[name] = valueNode.value;
        return acc;
      }, {});
  }

  private _setScanNodes(prefix: string, keys: string[]) {
    distinct(flatMap(keys, key => getAllPrefixes(key)))
      .map(path => [...(prefix === '' ? [] : [prefix]), path, '_'].join('/'))
      .forEach(key => this._cache.set(key, RepositoryKey.cached(true)));
  }

  private _updateNode(key: string, value: any) {
    if (value === undefined) {
      this._cache.set(key, RepositoryKey.missing());
    } else {
      this._cache.set(key, RepositoryKey.cached(false, value));
    }
  }

  private static _ensurePolicy(policy: GetPolicy | null | undefined) {
    if (isNullOrUndefined(policy)) return policy;
    if (typeof policy !== 'object') throw new TypeError('expected getPolicy to be an object');

    // @ts-ignore TS2367 (legacy support)
    if (policy.notReady === 'refresh') {
      policy = { ...policy, notReady: NotReadyPolicy.wait };
    }

    if (!isNullOrUndefined(policy.notReady) && ![NotReadyPolicy.wait, NotReadyPolicy.throw].includes(policy.notReady)) {
      throw new TypeError(`expected notReady policy to be one of ['wait', 'throw'], instead got '${policy.notReady}'`);
    }

    if (
      !isNullOrUndefined(policy.notPrepared) &&
      ![NotPreparedPolicy.prepare, NotPreparedPolicy.throw].includes(policy.notPrepared)
    ) {
      throw new TypeError(
        `expected notPrepared policy to be one of ['prepare', 'throw'], instead got '${policy.notPrepared}'`,
      );
    }

    return policy;
  }
}

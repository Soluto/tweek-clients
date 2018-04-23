import { isNullOrUndefined, isObject } from 'util';
import { ITweekClient, Context, FetchConfig } from 'tweek-client';
import { createChangeEmitter } from 'change-emitter';
import Observable = require('zen-observable');
import $$observable from 'symbol-observable';
import Trie from './trie';
import { partitionByIndex, snakeToCamelCase, distinct, delay } from './utils';
import Optional from './optional';
import MemoryStore from './memory-store';
import { FlatKeys, GetPolicy, ITweekStore, TweekRepositoryConfig, RepositoryKey, CachedKey, Expiration } from './types';

export const TweekKeySplitJoin = {
  split: (key: string) => {
    return key.toLowerCase().split('/');
  },
  join: (fragments: string[]) => fragments.join('/'),
};

let getAllPrefixes = key => {
  return key
    .split('/')
    .slice(0, -1)
    .reduce((acc, next) => [...acc, [...acc.slice(-1), next].join('/')], []);
};

let getKeyPrefix = key =>
  key
    .split('/')
    .slice(0, -1)
    .join('/');

let flatMap = (arr, fn) => Array.prototype.concat.apply([], arr.map(fn));

export default class TweekRepository {
  private _emitter = createChangeEmitter();
  private _cache = new Trie<RepositoryKey<any>>(TweekKeySplitJoin);
  private _store: ITweekStore;
  private _client: ITweekClient;
  private _context: Context = {};
  private _getPolicy: GetPolicy;
  private _refreshDelay: number;
  private _isDirty = false;
  private _backoffExponent = 1;

  private _refreshInProgress = false;
  private _refreshPromise: Promise<void>;
  private _nextRefreshPromise: Promise<void>;

  constructor({ client, getPolicy, refreshInterval, refreshDelay }: TweekRepositoryConfig) {
    this._client = client;
    this._store = new MemoryStore();
    this._getPolicy = { notReady: 'wait', notPrepared: 'prepare', ...TweekRepository._ensurePolicy(getPolicy) };
    this._refreshDelay = refreshDelay || refreshInterval || 30;
    this._refreshPromise = Promise.resolve();
    this._nextRefreshPromise = Promise.resolve();

    if (refreshInterval) {
      console.warn("TweekRepository constructor argument 'refreshInterval' is deprecated.  Use 'refreshDelay' instead");
    }
  }

  set context(value: Context) {
    this._context = value;
  }

  public addKeys(keys: FlatKeys) {
    Object.entries(keys).forEach(([key, value]) =>
      this._cache.set(key, {
        state: 'cached',
        value: TweekRepository._tryParse(value),
        isScan: false,
      }),
    );
  }

  public useStore(store) {
    this._store = store;
    return this._store.load().then(keys => {
      keys = keys || {};
      Object.entries(keys).forEach(([key, value]) => {
        if (value.expiration) {
          this._dirtyRefresh();
          this._cache.set(key, {
            ...value,
            expiration: 'expired',
          });
        } else {
          this._cache.set(key, value);
        }
      });
    });
  }

  public prepare(key: string) {
    let node = this._cache.get(key);
    if (!node) {
      let isScan = TweekRepository._isScan(key);
      this._cache.set(key, { state: 'requested', isScan });
      this._dirtyRefresh();
    }
  }

  public get(key: string, policy?: GetPolicy): Promise<never | Optional<any> | any> {
    return new Promise((resolve, reject) => {
      const observer = this.observe(key, policy);
      let subscription;
      observer.subscribe({
        start: s => (subscription = s),
        next: value => {
          subscription.unsubscribe();
          resolve(value);
        },
        error: error => {
          subscription.unsubscribe();
          reject(error);
        },
      });
    });
  }

  public refresh(keysToRefresh = Object.keys(this._cache.list())) {
    let isExpired = false;
    let isRefreshing = false;

    for (let key of keysToRefresh) {
      const node = this._cache.get(key);
      if (!node) {
        if (this._getPolicy.notPrepared === 'throw') {
          throw `key ${key} not managed, use prepare to add it to cache`;
        } else {
          this.prepare(key);
          isExpired = true;
          continue;
        }
      }

      if (node.expiration === 'refreshing') {
        isRefreshing = true;
      } else {
        isExpired = true;
        this._dirtyRefresh();
        if (node.expiration !== 'expired') {
          this._cache.set(key, {
            ...node,
            expiration: 'expired',
          });
        }
      }
    }

    if (isExpired) return this._nextRefreshPromise;
    if (isRefreshing) return this._refreshPromise;
    return Promise.resolve();
  }

  public observe(key: string, policy: GetPolicy = {}) {
    policy = { ...this._getPolicy, ...TweekRepository._ensurePolicy(policy) };
    const isScan = TweekRepository._isScan(key);
    const self = this;
    const observable = new Observable<any>(observer => {
      function handleNotReady() {
        switch (policy.notReady) {
          case 'wait':
            return self.refresh([key]);
          default:
            return observer.error('value not available yet for key: ' + key);
        }
      }

      function onKey() {
        const node = self._cache.get(key);

        if (!node) {
          if (policy.notPrepared === 'prepare') return self.prepare(key);
          return observer.error(`key ${key} not managed, use prepare to add it to cache`);
        }

        if (isScan) {
          const prefix = getKeyPrefix(key);
          const relative = Object.entries(self._cache.listRelative(prefix));
          if (
            node.state === 'requested' ||
            relative.some(([key, value]) => value.state === 'requested' && !value.isScan)
          ) {
            return handleNotReady();
          }
          return observer.next(self._extractScanResult(key));
        }

        if (node.state === 'requested') return handleNotReady();
        if (node.state === 'missing') return observer.next(Optional.none());
        if (node.isScan) return observer.error('corrupted cache');
        return observer.next(Optional.some(node.value));
      }

      onKey();

      return self._emitter.listen(onKey);
    });

    return {
      subscribe: observable.subscribe.bind(observable),
      [$$observable]() {
        return this;
      },
    };
  }

  public [$$observable]() {
    return this.observe('_');
  }

  private _dirtyRefresh() {
    this._isDirty = true;
    this._rollRefresh();
  }

  private _rollRefresh() {
    if (this._refreshInProgress || !this._isDirty) return this._refreshPromise;

    this._refreshInProgress = true;

    this._refreshPromise = delay(Math.pow(this._refreshDelay, this._backoffExponent)).then(() => this._refreshKeys());

    this._nextRefreshPromise = this._refreshPromise
      .then(() => {
        this.__backoffExponent = 1;
        this._refreshInProgress = false;
        return this._rollRefresh();
      })
      .catch(err => {
        this._refreshInProgress = false;
        this._backoffExponent = Math.max(this._backoffExponent + 1, 32)
        this._dirtyRefresh();
        throw err;
      });

    return this._refreshPromise;
  }

  private _refreshKeys() {
    if (!this._isDirty) return Promise.resolve();
    this._isDirty = false;

    let expiredKeys = Object.entries(this._cache.list()).filter(
      ([key, valueNode]) => valueNode.state === 'requested' || valueNode.expiration === 'expired',
    );

    if (expiredKeys.length === 0) return Promise.resolve();

    expiredKeys.forEach(([key, valueNode]) =>
      this._cache.set(key, {
        ...valueNode,
        expiration: 'refreshing',
      }),
    );

    let keysToRefresh = expiredKeys.map(([key]) => key);

    const fetchConfig: FetchConfig = {
      flatten: true,
      casing: 'snake',
      context: this._context,
      include: keysToRefresh,
    };

    return this._client
      .fetch<any>('_', fetchConfig)
      .catch(err => {
        expiredKeys.forEach(([key, valueNode]) =>
          this._cache.set(key, {
            ...valueNode,
            expiration: 'expired',
          }),
        );
        this._isDirty = true;
        throw err;
      })
      .then(keyValues => this._updateTrieKeys(keysToRefresh, keyValues))
      .then(() => this._store.save(this._cache.list()))
      .then(() => this._emitter.emit());
  }

  private _updateTrieKeys(keys, keyValues) {
    let valuesTrie;
    for (let keyToUpdate of keys) {
      const isScan = TweekRepository._isScan(keyToUpdate);
      if (isScan) {
        if (!valuesTrie) {
          valuesTrie = new Trie(TweekKeySplitJoin);
          Object.entries(keyValues).forEach(([k, v]) => {
            valuesTrie.set(k, v);
          });
        }
        this._updateTrieScanKey(keyToUpdate, keyValues, valuesTrie);
      } else {
        this._updateNode(keyToUpdate, keyValues[keyToUpdate]);
      }
    }
  }

  private _updateTrieScanKey(key, keyValues, valuesTrie) {
    let prefix = getKeyPrefix(key);

    let entries = Object.entries(this._cache.list(prefix));
    entries.forEach(([subKey, valueNode]) => {
      this._updateNode(subKey, keyValues[subKey]);
      if (valueNode.state === 'missing' || !valueNode.isScan) {
        return;
      }

      this._cache.set(subKey, { state: 'cached', isScan: true });
      let fullPrefix = getKeyPrefix(subKey);
      let nodes = fullPrefix === '' ? valuesTrie.list() : valuesTrie.listRelative(fullPrefix);
      this._setScanNodes(fullPrefix, Object.keys(nodes), 'cached');
      Object.entries(nodes).forEach(([n, value]) => {
        let fullKey = [...(fullPrefix === '' ? [] : [fullPrefix]), n].join('/');
        this._cache.set(fullKey, { state: 'cached', value, isScan: false });
      });
    });
  }

  private _extractScanResult(key) {
    let prefix = getKeyPrefix(key);
    return Object.entries(this._cache.listRelative(prefix))
      .filter(([key, valueNode]) => valueNode.state === 'cached' && !valueNode.isScan)
      .reduce((acc, [key, valueNode]: [string, CachedKey<any>]) => {
        let [fragments, [name]] = partitionByIndex(key.split('/').map(snakeToCamelCase), -1);
        let node = fragments.reduce((x, fragment) => {
          if (!x[fragment]) {
            x[fragment] = {};
          }
          return x[fragment];
        }, acc);
        node[name] = valueNode.value;
        return acc;
      }, {});
  }

  private _setScanNodes(prefix, keys, state, expiration?: Expiration) {
    distinct(flatMap(keys, key => getAllPrefixes(key)))
      .map(path => [...(prefix === '' ? [] : [prefix]), path, '_'].join('/'))
      .forEach(key => this._cache.set(key, { state: state, isScan: true, expiration }));
  }

  private _updateNode(key, value) {
    if (value === undefined) {
      this._cache.set(key, { state: 'missing' });
    } else {
      this._cache.set(key, {
        state: 'cached',
        isScan: false,
        value: value,
      });
    }
  }

  private static _tryParse(value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  private static _isScan(key) {
    return key === '_' || key.endsWith('/_');
  }

  private static _ensurePolicy(policy) {
    if (isNullOrUndefined(policy)) return policy;
    if (!isObject(policy)) throw new TypeError('expected getPolicy to be an object');

    if (policy.notReady === 'refresh') {
      policy = { ...policy, notReady: 'wait' };
    }

    if (!isNullOrUndefined(policy.notReady) && !['wait', 'throw'].includes(policy.notReady)) {
      throw new TypeError(`expected notReady policy to be one of ['wait', 'throw'], instead got '${policy.notReady}'`);
    }

    if (!isNullOrUndefined(policy.notPrepared) && !['prepare', 'throw'].includes(policy.notPrepared)) {
      throw new TypeError(
        `expected notPrepared policy to be one of ['prepare', 'throw'], instead got '${policy.notPrepared}'`,
      );
    }

    return policy;
  }
}

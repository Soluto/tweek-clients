import { ITweekClient, Context, FetchConfig } from 'tweek-client';
import { createChangeEmitter } from 'change-emitter';
import $$observable from 'symbol-observable';
import Trie from './trie';
import { partitionByIndex, snakeToCamelCase, distinct, delay } from './utils';
import Optional from './optional';

require('object.entries').shim();
require('object.values').shim();

export type TweekRepositoryKeys = {
  [key: string]: RepositoryKey<any>;
};

export type FlatKeys = {
  [key: string]: string | number | boolean;
};

export const TweekKeySplitJoin = {
  split: (key: string) => {
    return key.toLowerCase().split('/');
  },
  join: (fragments: string[]) => fragments.join('/'),
};

export interface ITweekStore {
  save: (keys: TweekRepositoryKeys) => Promise<void>;
  load: () => Promise<TweekRepositoryKeys>;
}

export type Expiration = 'expired' | 'refreshing';

export type RequestedKey = {
  state: 'requested';
  isScan: boolean;
  expiration?: Expiration;
};

export type MissingKey = {
  state: 'missing';
  expiration?: Expiration;
};

export type CachedKey<T> = {
  state: 'cached';
  value: T;
  isScan: false;
  expiration?: Expiration;
};

export type ScanNode = {
  state: 'cached' | 'requested';
  isScan: true;
  expiration?: Expiration;
};

export type RepositoryKey<T> = CachedKey<T> | RequestedKey | ScanNode | MissingKey;

export type TweekRepositoryConfig = {
  client: ITweekClient;
  getPolicy?: GetPolicy;
  refreshInterval?: number;
};

export type GetPolicy = {
  notReady?: 'throw' | 'refresh' | 'refreshAll';
  notPrepared?: 'throw' | 'prepare';
};

export type Observer = {
  start?: (subscription) => void;
  next?: (value) => void;
  error?: (error) => void;
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

export class MemoryStore implements ITweekStore {
  _keys;

  constructor(initialKeys = {}) {
    this._keys = initialKeys;
  }

  save(keys) {
    this._keys = keys || {};
    return Promise.resolve();
  }

  load() {
    return Promise.resolve(this._keys);
  }
}

export default class TweekRepository {
  private _emitter = createChangeEmitter();
  private _cache = new Trie<RepositoryKey<any>>(TweekKeySplitJoin);
  private _store: ITweekStore;
  private _client: ITweekClient;
  private _context: Context = {};
  private _getPolicy: GetPolicy;
  private _refreshInterval: number;

  private _refreshPromise: Promise<void>;
  private _nextRefreshPromise: Promise<void>;

  constructor({ client, getPolicy, refreshInterval = 100 }: TweekRepositoryConfig) {
    this._client = client;
    this._store = new MemoryStore();
    this._getPolicy = { notReady: 'refresh', notPrepared: 'prepare', ...getPolicy };
    this._refreshInterval = refreshInterval;

    this._refreshPromise = Promise.resolve();
    this._nextRefreshPromise = delay(this._refreshInterval).then(() => this._rollRefresh());
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
        this._cache.set(key, {
          ...value,
          expiration: value.expiration === 'refreshing' ? 'expired' : value.expiration,
        });
      });
    });
  }

  public prepare(key: string) {
    let node = this._cache.get(key);
    if (!node) {
      let isScan = TweekRepository._isScan(key);
      this._cache.set(key, { state: 'requested', isScan });
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
    policy = { ...this._getPolicy, ...policy };
    const emitter = this._emitter;
    const isScan = TweekRepository._isScan(key);

    const onKey = (observer: Observer) => {
      const handleNext = value => observer.next && observer.next(value);
      const handleError = err => {
        if (observer.error) observer.error(err);
        else throw err;
      };
      const handleNotReady = () => {
        switch (policy.notReady) {
          case 'refresh':
            return this.refresh([key]);
          case 'refreshAll':
            return this.refresh();
          default:
            return handleError('value not available yet for key: ' + key);
        }
      };

      const node = this._cache.get(key);

      if (!node) {
        if (policy.notPrepared === 'prepare') return this.prepare(key);
        return handleError(`key ${key} not managed, use prepare to add it to cache`);
      }

      if (isScan) {
        const prefix = getKeyPrefix(key);
        const relative = Object.entries(this._cache.listRelative(prefix));
        if (
          node.state === 'requested' ||
          relative.some(([key, value]) => value.state === 'requested' && !value.isScan)
        ) {
          return handleNotReady();
        }
        return handleNext(this._extractScanResult(key));
      }

      if (node.state === 'requested') return handleNotReady();
      if (node.state === 'missing') return handleNext(Optional.none());
      if (node.isScan) return handleError('corrupted cache');
      return handleNext(Optional.some(node.value));
    };

    return {
      subscribe(observerOrNext: Observer | ((value) => void), onError?: (error) => void) {
        const observer =
          typeof observerOrNext === 'function'
            ? {
                next: observerOrNext,
                error: onError,
              }
            : observerOrNext;

        function observeState() {
          onKey(observer);
        }

        let closed = false;
        const unlisten = emitter.listen(observeState);
        const subscription = {
          get closed() {
            return closed;
          },
          unsubscribe: () => {
            closed = true;
            return unlisten();
          },
        };

        if (observer.start) {
          observer.start(subscription);
        }

        observeState();

        return subscription;
      },
      [$$observable]() {
        return this;
      },
    };
  }

  public [$$observable]() {
    return this.observe('_');
  }

  private _rollRefresh() {
    this._refreshPromise = this._refreshKeys();
    this._nextRefreshPromise = this._refreshPromise
      .catch(() => {})
      .then(() => delay(this._refreshInterval))
      .then(() => this._rollRefresh());
    return this._refreshPromise;
  }

  private _refreshKeys() {
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
}

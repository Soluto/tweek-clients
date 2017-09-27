import Trie from './trie';
import { ITweekClient, Context, FetchConfig } from 'tweek-client';
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
    if (!node) this._requestKey(key);
  }

  public get(key: string, policy?: GetPolicy): Promise<never | Optional<any> | any> {
    policy = { ...this._getPolicy, ...policy };

    let isScan = TweekRepository._isScan(key);
    let node = this._cache.get(key);

    if (!node) {
      if (policy.notPrepared === 'prepare') {
        this.prepare(key);
        return this.get(key, policy);
      }
      return Promise.reject(`key ${key} not managed, use prepare to add it to cache`);
    }

    if (isScan) {
      let prefix = getKeyPrefix(key);
      let relative = Object.entries(this._cache.listRelative(prefix));
      if (node.state === 'requested' || relative.some(([key, value]) => value.state === 'requested' && !value.isScan)) {
        if (policy.notReady === 'throw') {
          return Promise.reject('value not available yet for key: ' + key);
        }

        const refreshPromise =
          policy.notReady === 'refresh' ? this.refresh(relative.map(([key]) => key)) : this.refresh();
        return refreshPromise.then(() => this.get(key, policy));
      }
      return Promise.resolve(this._extractScanResult(key));
    }
    if (node.state === 'requested') {
      if (policy.notReady === 'throw') {
        return Promise.reject('value not available yet');
      }

      const refreshPromise = policy.notReady === 'refresh' ? this.refresh([key]) : this.refresh();
      return refreshPromise.then(() => this.get(key, policy));
    }
    if (node.state === 'missing') return Promise.resolve(Optional.none());
    if (node.isScan) return Promise.reject('corrupted cache');
    return Promise.resolve(Optional.some(node.value));
  }

  public refresh(keysToRefresh = Object.keys(this._cache.list())) {
    let isExpired = false;
    let isRefreshing = false;

    keysToRefresh.forEach(key => {
      let node = this._cache.get(key);
      if (!node) {
        if (this._getPolicy.notPrepared === 'throw') {
          throw `key ${key} not managed, use prepare to add it to cache`;
        } else {
          node = this._requestKey(key);
        }
      }

      if (node.expiration === 'refreshing') {
        isRefreshing = true;
      } else {
        isExpired = true;
        this._cache.set(key, {
          ...node,
          expiration: 'expired',
        });
      }
    });

    if (isExpired) return this._nextRefreshPromise;
    if (isRefreshing) return this._refreshPromise;
    return Promise.resolve();
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
      .then(config => this._updateTrieKeys(keysToRefresh, config))
      .then(() => this._store.save(this._cache.list()));
  }

  private _updateTrieKeys(keys, config) {
    keys.forEach(keyToUpdate => {
      const isScan = TweekRepository._isScan(keyToUpdate);
      if (!isScan) {
        this._updateNode(keyToUpdate, config[keyToUpdate]);
        return;
      }

      this._updateTrieScanKey(keyToUpdate, config);
    });
  }

  private _updateTrieScanKey(key, config) {
    let prefix = getKeyPrefix(key);

    let configResults = new Trie(TweekKeySplitJoin);
    Object.entries(config).forEach(([k, v]) => {
      configResults.set(k, v);
    });

    let entries = Object.entries(this._cache.list(prefix));
    entries.forEach(([subKey, valueNode]) => {
      this._updateNode(subKey, config[subKey]);
      if (valueNode.state === 'missing' || !valueNode.isScan) {
        return;
      }

      this._cache.set(subKey, { state: 'cached', isScan: true });
      let fullPrefix = getKeyPrefix(subKey);
      let nodes = fullPrefix === '' ? configResults.list() : configResults.listRelative(fullPrefix);
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

  private _requestKey(key) {
    let isScan = TweekRepository._isScan(key);
    let node: RequestedKey = { state: 'requested', isScan, expiration: 'expired' };
    this._cache.set(key, node);
    return node;
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

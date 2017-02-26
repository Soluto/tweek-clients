import Trie from './trie';
import { TweekClient, ITweekClient, Context, FetchConfig } from '../tweek-rest';
import { partitionByIndex, snakeToCamelCase, distinct } from './utils';
import Optional from "./optional";

require("object.entries").shim();
require("object.values").shim();

export type KeyCollection = {
    [key: string]: any;
}

export const TweekKeySplitJoin = {
    split: (key: string) => { return key.split("/"); },
    join: (fragments: string[]) => fragments.join("/")
}

export interface TweekStore {
    save: (keys: KeyCollection) => Promise<void>;
    load: () => Promise<KeyCollection>;
}

type RequestedKey = {
    state: "requested"
    isScan: boolean;
}

type MissingKey = {
    state: "missing"
}

type CachedKey<T> = {
    state: "cached";
    value: T;
    isScan: false;
}

type ScanNode = {
    state: "cached" | "requested";
    isScan: true
}

type RepositoryKey<T> = CachedKey<T> | RequestedKey | ScanNode | MissingKey;

export type TweekRepositoryConfig = {
    client: ITweekClient;
    store: TweekStore;
}

export type ConfigurationLocation = "local" | "remote";

let getAllPrefixes = (key) => {
    return partitionByIndex(key.split("/"), -1)[0].reduce((acc, next) =>
        ([...acc, [...acc.slice(-1), next].join("/")]), []);
}

let getKeyPrefix = (key) => key === "_" ? "" : partitionByIndex(key.split("/"), -1)[0].join("/");

let flatMap = (arr, fn) => Array.prototype.concat.apply([], arr.map(fn))

export class MemoryStore implements TweekStore {
    _keys;

    constructor(initialKeys = {}) {
        this._keys = initialKeys
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
    private _store: TweekStore;
    private _client: ITweekClient;
    public context: Context = {};

    constructor({client, store = new MemoryStore() }: TweekRepositoryConfig) {
        this._client = client;
        this._store = store;
    }

    init() {
        return this._store.load().then(nodes => {
            nodes = nodes || {};
            Object.entries(nodes).forEach(([key, value]) => this._cache.set(key, value));
        });
    }

    prepare(key: string) {
        let node = this._cache.get(key);
        let isScan = key.slice(-1) === "_";
        if (!node) this._cache.set(key, { state: "requested", isScan });
    }

    get(key: string): Promise<never | Optional<any> | any> {
        let isScan = key.slice(-1) === "_";
        let node = this._cache.get(key);

        if (isScan && node) {
            let prefix = getKeyPrefix(key);

            if (node.state === "requested" ||
                Object.entries(this._cache.listRelative(prefix)).some(([key, value]) => value.state === "requested" && !value.isScan)) {
                return Promise.reject("value not available yet for key: " + key);
            }
            return Promise.resolve(this._extractScanResult(key));
        }
        if (!node) return Promise.reject(`key ${key} not managed, use prepare to add it to cache`);
        if (node.state === "requested") return Promise.reject("value not available yet");
        if (node.state === "missing") return Promise.resolve(Optional.none());
        if (node.isScan) return Promise.reject('corrupted cache');
        return Promise.resolve(Optional.some(node.value));
    }

    refresh() {
        const keysToRefresh = Object.keys(this._cache.list());
        if (!keysToRefresh || keysToRefresh.length < 1) return Promise.resolve();

        return this._refreshKeys(keysToRefresh)
            .then(() => this._store.save(this._cache.list()));
    }

    private _refreshKeys(keys: string[]) {
        const fetchConfig: FetchConfig = {
            flatten: true,
            casing: "snake",
            context: this.context,
            include: keys,
        };

        return this._client
            .fetch<any>('_', fetchConfig)
            .then(config => this._updateTrieKeys(keys, config))
            .catch(e => {
                console.warn('failed refreshing keys', keys, e);
            });
    }

    private _updateTrieKey(key, config) {
        let prefix = getKeyPrefix(key);

        let configResults = new Trie(TweekKeySplitJoin);
        Object.entries(config).forEach(([k, v]) => {
            configResults.set(k, v)
        });

        let entries = Object.entries(this._cache.list(prefix));
        entries.forEach(([subKey, valueNode]) => {
            this.updateNode(subKey, valueNode, config[subKey]);
            if (valueNode.state === "missing" || !valueNode.isScan) {
                return;
            }

            this._cache.set(subKey, { state: "cached", isScan: true });
            let fullPrefix = getKeyPrefix(subKey);
            let nodes = fullPrefix === "" ? configResults.list() : configResults.listRelative(fullPrefix);
            this.setScanNodes(fullPrefix, Object.keys(nodes), "cached");
            Object.entries(nodes).forEach(([n, value]) => {
                let fullKey = [...(fullPrefix === "" ? [] : [fullPrefix]), n].join("/");
                this._cache.set(fullKey, { state: "cached", value, isScan: false });
            })
        });
    }

    private _updateTrieKeys(keys, config) {
        keys.forEach(keyToUpdate => {
            const isScan = keyToUpdate.slice(-1) === "_";
            if (!isScan) {
                this.updateNode(keyToUpdate, this._cache.get(keyToUpdate), config[keyToUpdate]);
                return;
            }

            this._updateTrieKey(keyToUpdate, config);
        });
    }

    private _extractScanResult(key) {
        let prefix = getKeyPrefix(key);
        return Object.entries(this._cache.listRelative(prefix))
            .filter(([key, valueNode]) => valueNode.state === "cached" && !valueNode.isScan)
            .reduce((acc, [key, valueNode]: [string, CachedKey<any>]) => {
                let [fragments, [name]] = partitionByIndex(key.split("/").map(snakeToCamelCase), -1);
                let node = fragments.reduce((node, fragment) => {
                    if (!acc[fragment]) {
                        acc[fragment] = {};
                    }
                    return acc[fragment];
                }, acc);
                node[name] = valueNode.value;
                return acc;
            }, {});
    }

    private setScanNodes(prefix, keys, state) {
        distinct(flatMap(keys, (key) => getAllPrefixes(key)))
            .map(path => [...(prefix === "" ? [] : [prefix]), path, "_"].join("/"))
            .forEach(key => this._cache.set(key, { state: state, isScan: true }));
    }

    private updateNode(key, node, value) {
        if (node.state !== "cached" && value === undefined) {
            this._cache.set(key, { state: "missing" });
        }
        else if (value !== undefined) {
            this._cache.set(key, {
                state: "cached",
                isScan: false,
                value: value
            });
        }
    }

    private _persist(config) {
        return this._store.save(config).then(() => config);
    }
}
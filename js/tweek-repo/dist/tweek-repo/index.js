import Trie from './trie';
import { partitionByIndex, snakeToCamelCase, distinct } from './utils';
require("object.entries").shim();
require("object.values").shim();
export const TweekKeySplitJoin = {
    split: (key) => key.split("/"),
    join: (fragments) => fragments.join("/")
};
let getAllPrefixes = (key) => partitionByIndex(key.split("/"), -1)[0].reduce((acc, next) => ([...acc, [...acc, next].join("/")]), []);
let getKeyPrefix = (key) => partitionByIndex(key.split("/"), -1)[0].join("/");
let flatMap = (arr, fn) => Array.prototype.concat.apply([], arr.map(fn));
export default class TweekRepository {
    constructor({ client, keys = {} }) {
        this._cache = new Trie(TweekKeySplitJoin);
        this._client = client;
        let entries = Object.entries(keys);
        entries.forEach(([key, value]) => this._cache.set(key, {
            state: "cached",
            isScan: false,
            value: value
        }));
        this.setScanNodes("", entries, "cached");
    }
    prepare(key) {
        let node = this._cache.get(key);
        let isScan = key.slice(-1) === "_";
        if (!node)
            this._cache.set(key, { state: "requested", isScan });
    }
    get(key) {
        let isScan = key.slice(-1) === "_";
        let node = this._cache.get(key);
        if (isScan && node) {
            let prefix = getKeyPrefix(key);
            if (node.state === "requested" || Object.entries(this._cache.listRelative(prefix)).some(([key, value]) => value.state === "requested" && !value.isScan)) {
                return Promise.reject("value not available yet for key: " + key);
            }
            return Promise.resolve(this._extractScanResult(key));
        }
        if (!node)
            return Promise.reject(`key ${key} not managed, use prepare to add it to cache`);
        if (node.state === "requested")
            return Promise.reject("value not available yet");
        if (node.state === "missing")
            return Promise.resolve();
        if (!node.isScan)
            return Promise.resolve(node.value);
    }
    _extractScanResult(key) {
        let prefix = getKeyPrefix(key);
        return Object.entries(this._cache.listRelative(prefix))
            .filter(([key, valueNode]) => valueNode.state === "cached" && !valueNode.isScan)
            .reduce((acc, [key, valueNode]) => {
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
    setScanNodes(prefix, entries, state) {
        distinct(flatMap(entries, ([key, _]) => getAllPrefixes(key)))
            .map(path => [...(prefix === "" ? [] : [prefix]), path, "_"].join("/"))
            .forEach(key => this._cache.set(key, {
            state: state,
            isScan: true
        }));
    }
    updateNode(key, node, value) {
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
    _refreshKey(key) {
        let isScan = key.slice(-1) === "_";
        return this._client.fetch(key, { flatten: true, casing: "snake" })
            .then(config => {
            if (isScan) {
                let prefix = getKeyPrefix(key);
                let entries = Object.entries(this._cache.list(prefix));
                entries.forEach(([subKey, valueNode]) => {
                    let fullKey = [...(prefix === "" ? [] : [prefix]), subKey].join("/");
                    this.updateNode(subKey, valueNode, config[subKey]);
                });
                this.setScanNodes(prefix, entries, "cached");
            }
            else {
                this.updateNode(key, this._cache.get(key), config);
            }
        });
    }
    refresh() {
        return this._refreshKey("_");
    }
}
//# sourceMappingURL=index.js.map
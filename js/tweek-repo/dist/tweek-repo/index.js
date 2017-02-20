"use strict";
var trie_1 = require("./trie");
var utils_1 = require("./utils");
var optional_1 = require("./optional");
require("object.entries").shim();
require("object.values").shim();
exports.TweekKeySplitJoin = {
    split: function (key) { return key.split("/"); },
    join: function (fragments) { return fragments.join("/"); }
};
var getAllPrefixes = function (key) {
    return utils_1.partitionByIndex(key.split("/"), -1)[0].reduce(function (acc, next) {
        return (acc.concat([acc.slice(-1).concat([next]).join("/")]));
    }, []);
};
var getKeyPrefix = function (key) { return key === "_" ? "" : utils_1.partitionByIndex(key.split("/"), -1)[0].join("/"); };
var flatMap = function (arr, fn) { return Array.prototype.concat.apply([], arr.map(fn)); };
var MemoryStore = (function () {
    function MemoryStore(initialKeys) {
        if (initialKeys === void 0) { initialKeys = {}; }
        this._keys = initialKeys;
    }
    MemoryStore.prototype.save = function (keys) {
        this._keys = keys || {};
        return Promise.resolve();
    };
    MemoryStore.prototype.load = function () {
        return Promise.resolve(this._keys);
    };
    return MemoryStore;
}());
exports.MemoryStore = MemoryStore;
var TweekRepository = (function () {
    function TweekRepository(_a) {
        var client = _a.client, _b = _a.store, store = _b === void 0 ? new MemoryStore() : _b;
        this._cache = new trie_1.default(exports.TweekKeySplitJoin);
        this.context = {};
        this._client = client;
        this._store = store;
    }
    TweekRepository.prototype.init = function () {
        var _this = this;
        return this._store.load().then(function (nodes) {
            nodes = nodes || {};
            Object.entries(nodes).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                return _this._cache.set(key, value);
            });
        });
    };
    TweekRepository.prototype.prepare = function (key) {
        var node = this._cache.get(key);
        var isScan = key.slice(-1) === "_";
        if (!node)
            this._cache.set(key, { state: "requested", isScan: isScan });
    };
    TweekRepository.prototype.get = function (key) {
        var isScan = key.slice(-1) === "_";
        var node = this._cache.get(key);
        if (isScan && node) {
            var prefix = getKeyPrefix(key);
            if (node.state === "requested" ||
                Object.entries(this._cache.listRelative(prefix)).some(function (_a) {
                    var key = _a[0], value = _a[1];
                    return value.state === "requested" && !value.isScan;
                })) {
                return Promise.reject("value not available yet for key: " + key);
            }
            return Promise.resolve(this._extractScanResult(key));
        }
        if (!node)
            return Promise.reject("key " + key + " not managed, use prepare to add it to cache");
        if (node.state === "requested")
            return Promise.reject("value not available yet");
        if (node.state === "missing")
            return Promise.resolve(optional_1.default.none());
        if (node.isScan)
            return Promise.reject('corrupted cache');
        return Promise.resolve(optional_1.default.some(node.value));
    };
    TweekRepository.prototype.refresh = function () {
        var _this = this;
        var keysToRefresh = Object.keys(this._cache.list());
        return this._refreshKeys(keysToRefresh)
            .then(function () { return _this._store.save(_this._cache.list()); });
    };
    TweekRepository.prototype._refreshKeys = function (keys) {
        var _this = this;
        return this._client.fetch(keys, { flatten: true, casing: "snake", context: this.context })
            .then(function (config) { return _this._updateTrieKeys(keys, config); })
            .catch(function (e) {
            console.warn('failed refreshing keys', keys, e);
        });
    };
    TweekRepository.prototype._updateTrieKey = function (key, config) {
        var _this = this;
        var prefix = getKeyPrefix(key);
        var configResults = new trie_1.default(exports.TweekKeySplitJoin);
        Object.entries(config).forEach(function (_a) {
            var k = _a[0], v = _a[1];
            configResults.set(k, v);
        });
        var entries = Object.entries(this._cache.list(prefix));
        entries.forEach(function (_a) {
            var subKey = _a[0], valueNode = _a[1];
            _this.updateNode(subKey, valueNode, config[subKey]);
            if (valueNode.state === "missing" || !valueNode.isScan) {
                return;
            }
            _this._cache.set(subKey, { state: "cached", isScan: true });
            var fullPrefix = getKeyPrefix(subKey);
            var nodes = fullPrefix === "" ? configResults.list() : configResults.listRelative(fullPrefix);
            _this.setScanNodes(fullPrefix, Object.keys(nodes), "cached");
            Object.entries(nodes).forEach(function (_a) {
                var n = _a[0], value = _a[1];
                var fullKey = (fullPrefix === "" ? [] : [fullPrefix]).concat([n]).join("/");
                _this._cache.set(fullKey, { state: "cached", value: value, isScan: false });
            });
        });
    };
    TweekRepository.prototype._updateTrieKeys = function (keys, config) {
        var _this = this;
        keys.forEach(function (keyToUpdate) {
            var isScan = keyToUpdate.slice(-1) === "_";
            if (!isScan) {
                _this.updateNode(keyToUpdate, _this._cache.get(keyToUpdate), config[keyToUpdate]);
                return;
            }
            _this._updateTrieKey(keyToUpdate, config);
        });
    };
    TweekRepository.prototype._extractScanResult = function (key) {
        var prefix = getKeyPrefix(key);
        return Object.entries(this._cache.listRelative(prefix))
            .filter(function (_a) {
            var key = _a[0], valueNode = _a[1];
            return valueNode.state === "cached" && !valueNode.isScan;
        })
            .reduce(function (acc, _a) {
            var key = _a[0], valueNode = _a[1];
            var _b = utils_1.partitionByIndex(key.split("/").map(utils_1.snakeToCamelCase), -1), fragments = _b[0], name = _b[1][0];
            var node = fragments.reduce(function (node, fragment) {
                if (!acc[fragment]) {
                    acc[fragment] = {};
                }
                return acc[fragment];
            }, acc);
            node[name] = valueNode.value;
            return acc;
        }, {});
    };
    TweekRepository.prototype.setScanNodes = function (prefix, keys, state) {
        var _this = this;
        utils_1.distinct(flatMap(keys, function (key) { return getAllPrefixes(key); }))
            .map(function (path) { return (prefix === "" ? [] : [prefix]).concat([path, "_"]).join("/"); })
            .forEach(function (key) { return _this._cache.set(key, { state: state, isScan: true }); });
    };
    TweekRepository.prototype.updateNode = function (key, node, value) {
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
    };
    TweekRepository.prototype._persist = function (config) {
        return this._store.save(config).then(function () { return config; });
    };
    return TweekRepository;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TweekRepository;
//# sourceMappingURL=index.js.map
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
var getAllPrefixes = function (key) { return utils_1.partitionByIndex(key.split("/"), -1)[0].reduce(function (acc, next) {
    return (acc.concat([acc.concat([next]).join("/")]));
}, []); };
var getKeyPrefix = function (key) { return utils_1.partitionByIndex(key.split("/"), -1)[0].join("/"); };
var flatMap = function (arr, fn) { return Array.prototype.concat.apply([], arr.map(fn)); };
var TweekRepository = (function () {
    function TweekRepository(_a) {
        var client = _a.client, _b = _a.keys, keys = _b === void 0 ? {} : _b;
        var _this = this;
        this._cache = new trie_1.default(exports.TweekKeySplitJoin);
        this._client = client;
        var entries = Object.entries(keys);
        entries.forEach(function (_a) {
            var key = _a[0], value = _a[1];
            return _this._cache.set(key, {
                state: "cached",
                isScan: false,
                value: value
            });
        });
        this.setScanNodes("", entries, "cached");
    }
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
            if (node.state === "requested" || Object.entries(this._cache.listRelative(prefix)).some(function (_a) {
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
    TweekRepository.prototype.setScanNodes = function (prefix, entries, state) {
        var _this = this;
        utils_1.distinct(flatMap(entries, function (_a) {
            var key = _a[0], _ = _a[1];
            return getAllPrefixes(key);
        }))
            .map(function (path) { return (prefix === "" ? [] : [prefix]).concat([path, "_"]).join("/"); })
            .forEach(function (key) { return _this._cache.set(key, {
            state: state,
            isScan: true
        }); });
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
    TweekRepository.prototype._refreshKey = function (key) {
        var _this = this;
        var isScan = key.slice(-1) === "_";
        return this._client.fetch(key, { flatten: true, casing: "snake" })
            .then(function (config) {
            if (isScan) {
                var prefix_1 = getKeyPrefix(key);
                var configResults_1 = new trie_1.default(exports.TweekKeySplitJoin);
                Object.entries(config).forEach(function (_a) {
                    var k = _a[0], v = _a[1];
                    return configResults_1.set(k, v);
                });
                var entries = Object.entries(_this._cache.list(prefix_1));
                entries.forEach(function (_a) {
                    var subKey = _a[0], valueNode = _a[1];
                    _this.updateNode(subKey, valueNode, config[subKey]);
                    if (valueNode.state !== "missing" && valueNode.isScan) {
                        var nodes = configResults_1.list(getKeyPrefix(subKey));
                        Object.entries(nodes).forEach(function (_a) {
                            var n = _a[0], value = _a[1];
                            var fullKey = (prefix_1 === "" ? [] : [prefix_1]).concat([n]).join("/");
                            _this._cache.set(fullKey, { state: "cached", value: value, isScan: false });
                        });
                    }
                });
                _this.setScanNodes(prefix_1, entries, "cached");
            }
            else {
                _this.updateNode(key, _this._cache.get(key), config);
            }
        }).catch(function () { return _this.updateNode(key, _this._cache.get(key), undefined); });
    };
    TweekRepository.prototype.refresh = function () {
        return this._refreshKey("_");
    };
    return TweekRepository;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TweekRepository;
//# sourceMappingURL=index.js.map
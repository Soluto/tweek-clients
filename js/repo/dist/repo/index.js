"use strict";
var trie_1 = require("./trie");
var utils_1 = require("./utils");
exports.TweekKeySplitJoin = {
    split: function (key) { return key.split("/"); },
    join: function (fragments) { return fragments.join("/"); }
};
var getKeyPrefix = function (key) { return utils_1.partitionByIndex(key.split("/"), -1)[0].join("/"); };
var TweekRepository = (function () {
    function TweekRepository(_a) {
        var client = _a.client, _b = _a.keys, keys = _b === void 0 ? {} : _b;
        var _this = this;
        this._cache = new trie_1["default"](exports.TweekKeySplitJoin);
        this._client = client;
        Object.entries(keys).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            return _this._cache.set(key, {
                state: "cached",
                isScan: false,
                value: value,
                isExpired: true
            });
        });
    }
    TweekRepository.prototype.expire = function (key) {
        var _this = this;
        var node = this._cache.get(key);
        if (node === null) {
            this._cache.set(key, { state: "requested" });
            return;
        }
        if (node.state === "cached") {
            node.isExpired = true;
        }
        setImmediate(function () { return _this.refresh(); });
    };
    TweekRepository.prototype.get = function (key) {
        var isScan = key.slice(-1) === "_";
        var node = this._cache.get(key);
        if (isScan) {
            return Promise.resolve(this._extractScanResult(key));
        }
        if (!node)
            return Promise.reject("key not managed, use expire to add it to cache");
        if (node.state === "requested")
            return Promise.reject("value not available");
        if (!node.isScan)
            return Promise.resolve(node.value);
    };
    TweekRepository.prototype._extractScanResult = function (key) {
        var prefix = key.replace("/_", "");
        return Object.entries(this._cache.listRelative(prefix)).reduce(function (acc, _a) {
            var key = _a[0], value = _a[1];
            var _b = utils_1.partitionByIndex(key.split("/").map(utils_1.snakeToCamelCase), -1), fragments = _b[0], name = _b[1][0];
            var node = fragments.reduce(function (node, fragment) {
                if (!acc[fragment]) {
                    acc[fragment] = {};
                }
                return acc[fragment];
            }, acc);
            node[name] = value;
            return acc;
        }, {});
    };
    TweekRepository.prototype.addScanNodes = function (prefix, entries) {
        var _this = this;
        utils_1.distinct(entries.map(function (_a) {
            var key = _a[0], _ = _a[1];
            return getKeyPrefix(key);
        }))
            .forEach(function (dir) { return _this._cache.set(prefix + "/" + dir + "/_", {
            state: "cached",
            isScan: true,
            isExpired: false
        }); });
    };
    TweekRepository.prototype._refreshKey = function (key) {
        var _this = this;
        var isScan = key.slice(-1) === "_";
        return this._client.fetch(key, { flatten: true, casing: "camelCase" })
            .then(function (config) {
            if (isScan) {
                var prefix_1 = getKeyPrefix(key);
                var entries = Object.entries(config);
                entries.forEach(function (_a) {
                    var subKey = _a[0], value = _a[1];
                    _this._cache.set(prefix_1 + "/" + subKey, {
                        state: "cached",
                        isExpired: false,
                        isScan: false,
                        value: value
                    });
                });
                _this.addScanNodes(prefix_1, entries);
            }
            else {
                _this._cache.set(key, {
                    state: "cached",
                    isScan: false,
                    isExpired: false,
                    value: config
                });
            }
        });
    };
    TweekRepository.prototype.refresh = function () {
        var keys = Object.entries(this._cache.list());
        if (keys.some(function (_a) {
            var key = _a[0], cachenode = _a[1];
            return cachenode.state === "requested" || cachenode.isExpired;
        })) {
            this._refreshKey("_");
        }
    };
    return TweekRepository;
}());
exports.__esModule = true;
exports["default"] = TweekRepository;
//# sourceMappingURL=index.js.map
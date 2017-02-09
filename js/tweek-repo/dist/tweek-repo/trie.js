"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var val = Symbol(); // .for("value");
var Trie = (function () {
    function Trie(_splitJoin) {
        this._splitJoin = _splitJoin;
        this._root = {};
    }
    Trie.prototype.set = function (key, value) {
        var fragments = this._splitJoin.split(key);
        var node = fragments.reduce(function (acc, next) {
            if (!acc[next]) {
                acc[next] = {};
            }
            return acc[next];
        }, this._root);
        node[val] = value;
    };
    Trie.prototype.get = function (key) {
        var fragments = this._splitJoin.split(key);
        var node = fragments.reduce(function (acc, next) {
            if (!acc)
                return null;
            return acc[next];
        }, this._root);
        return node && node[val];
    };
    Trie.prototype.listRelative = function (key) {
        var fragments = this._splitJoin.split(key);
        return this.list(key, fragments.length);
    };
    Trie.prototype.list = function (key, index) {
        var _this = this;
        if (index === void 0) { index = 0; }
        var fragments = key && this._splitJoin.split(key) || [];
        var node = fragments.reduce(function (acc, next) {
            if (!acc)
                return null;
            return acc[next];
        }, this._root);
        var results = Object.keys(node)
            .map(function (name) { return _this.list(_this._splitJoin.join(fragments.concat([name])), index); }).slice().reduce(function (acc, next) { return (__assign({}, acc, next)); }, node[val] !== undefined ? (_a = {},
            _a[this._splitJoin.join(fragments.slice(index))] = node[val],
            _a) : {});
        return results;
        var _a;
    };
    return Trie;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Trie;
//# sourceMappingURL=trie.js.map
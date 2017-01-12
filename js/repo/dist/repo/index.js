"use strict";
var trie_1 = require("./trie");
exports.TweekKeySplitJoin = {
    split: function (key) { return key.split("/"); },
    join: function (fragments) { return fragments.join("/"); }
};
var TweekRepository = (function () {
    function TweekRepository(client, keys) {
        var _this = this;
        this.client = client;
        this._cache = new trie_1["default"](exports.TweekKeySplitJoin);
        Object.keys(keys).forEach(function (k) { return _this._cache.add(k, {
            state: "offline",
            value: keys[k]
        }); });
    }
    TweekRepository.prototype.prepare = function (key) {
    };
    TweekRepository.prototype.get = function () {
    };
    TweekRepository.prototype.refresh = function () {
        for (var _i = 0, _a = Object.entries(this._cache.list()); _i < _a.length; _i++) {
            var key = _a[_i];
            ;
        }
    };
    return TweekRepository;
}());
exports.TweekRepository = TweekRepository;
//# sourceMappingURL=index.js.map
"use strict";
var trie_1 = require("./trie");
exports.TweekKeySplitJoin = {
    split: function (key) { return key.split("/"); },
    join: function (fragments) { return fragments.join("/"); }
};
var TweekRepository = (function () {
    function TweekRepository(keys) {
        var _this = this;
        this._cache = new trie_1["default"](exports.TweekKeySplitJoin);
        Object.keys(keys).forEach(function (k) { return _this._cache.add(k, {
            state: "offline",
            value: keys[k]
        }); });
    }
    TweekRepository.prototype.refresh = function () {
    };
    return TweekRepository;
}());
exports.TweekRepository = TweekRepository;
//# sourceMappingURL=index.js.map
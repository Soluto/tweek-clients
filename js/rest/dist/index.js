var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
    function captialize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    function snakeToCamelCase(target) {
        if (typeof (target) !== "object")
            return target;
        return Object.keys(target).reduce(function (o, key) {
            var _a = key.split("_"), firstKey = _a[0], others = _a.slice(1);
            var newKey = [firstKey].concat(others.map(captialize)).join("");
            o[newKey] = snakeToCamelCase(target[key]);
            return o;
        }, {});
    }
    function convertTypingFromJSON(target) {
        if (typeof (target) === "string") {
            try {
                return JSON.parse(target);
            }
            catch (e) {
                return target;
            }
        }
        if (typeof (target) === "object") {
            return Object.keys(target).reduce(function (o, key) {
                o[key] = convertTypingFromJSON(target[key]);
                return o;
            }, {});
        }
    }
    var TweekClient = (function () {
        function TweekClient(config) {
            this.config = config;
        }
        TweekClient.prototype.fetch = function (path, _config) {
            if (_config === void 0) { _config = {}; }
            var _a = __assign({}, this.config, _config), casing = _a.casing, baseServiceUrl = _a.baseServiceUrl, restGetter = _a.restGetter, convertTyping = _a.convertTyping;
            var result = restGetter(baseServiceUrl + "/" + path);
            if (casing === "camelCase") {
                result = result.then(snakeToCamelCase);
            }
            if (convertTyping) {
                result = result.then(convertTypingFromJSON);
            }
            return result;
        };
        return TweekClient;
    }());
    exports.__esModule = true;
    exports["default"] = TweekClient;
    function createTweekClient(baseServiceUrl) {
        var context = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            context[_i - 1] = arguments[_i];
        }
        return new TweekClient({ baseServiceUrl: baseServiceUrl,
            casing: "camelCase",
            convertTyping: true,
            context: context,
            restGetter: function (url) { return fetch(url).then(function (x) { return x.json(); }); } });
    }
    exports.createTweekClient = createTweekClient;
});
//# sourceMappingURL=index.js.map
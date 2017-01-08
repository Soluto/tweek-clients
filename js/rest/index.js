var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
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
    function convertTyping(target) {
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
                o[key] = convertTyping(target[key]);
                return o;
            }, {});
        }
    }
    var TweekClient = (function () {
        function TweekClient(_config) {
            this._config = _config;
        }
        TweekClient.prototype.fetch = function (path) {
            return __awaiter(this, void 0, Promise, function* () {
                var _a = this._config, casing = _a.casing, baseServiceUrl = _a.baseServiceUrl, restGetter = _a.restGetter, isTyped = _a.isTyped;
                var result = yield restGetter(baseServiceUrl + "/" + path);
                if (casing === "camelCase") {
                    result = snakeToCamelCase(result);
                }
                if (isTyped) {
                    result = convertTyping(result);
                }
                return result;
            });
        };
        return TweekClient;
    }());
    exports.TweekClient = TweekClient;
});

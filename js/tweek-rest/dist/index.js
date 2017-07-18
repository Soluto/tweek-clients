"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var queryString = require("query-string");
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
    else if (typeof (target) === "object") {
        return Object.keys(target).reduce(function (o, key) {
            o[key] = convertTypingFromJSON(target[key]);
            return o;
        }, {});
    }
    else
        return target;
}
var TweekClient = (function () {
    function TweekClient(config) {
        this.queryParamsEncoder = function (queryParams) { return queryParams
            .replace(/\$/g, TweekClient.ENCODE_$_CHARACTER)
            .replace(/\//g, TweekClient.ENCODE_SLASH_CHARACTER); };
        this._contextToQueryParams = function (context) {
            return Object.keys(context).reduce(function (pre, cur) {
                var identityContext = context[cur];
                Object.keys(identityContext).forEach(function (x) {
                    return x === 'id' ? pre["" + cur] = identityContext[x] : pre[cur + "." + x] = identityContext[x];
                });
                return pre;
            }, {});
        };
        this.config = __assign({ camelCase: "snake", flatten: false, convertTyping: false, context: {} }, config);
        var baseServiceUrl = config.baseServiceUrl;
        if (baseServiceUrl.endsWith('/')) {
            baseServiceUrl = baseServiceUrl.substr(0, baseServiceUrl.length - 1);
            this.config.baseServiceUrl = baseServiceUrl;
        }
    }
    TweekClient.prototype.fetch = function (path, _config) {
        var _a = __assign({}, this.config, _config), casing = _a.casing, flatten = _a.flatten, baseServiceUrl = _a.baseServiceUrl, restGetter = _a.restGetter, convertTyping = _a.convertTyping, context = _a.context, include = _a.include;
        var queryParamsObject = this._contextToQueryParams(context);
        if (flatten) {
            queryParamsObject['$flatten'] = true;
        }
        queryParamsObject['$include'] = include;
        var queryParams = queryString.stringify(queryParamsObject);
        queryParams = this.queryParamsEncoder(queryParams);
        var url = baseServiceUrl + (path.startsWith('/') ? '' : '/') + path + (!!queryParams ? "?" + queryParams : '');
        var result = restGetter(url);
        if (!flatten && casing === "camelCase") {
            result = result.then(snakeToCamelCase);
        }
        if (convertTyping) {
            result = result.then(convertTypingFromJSON);
        }
        return result;
    };
    TweekClient.ENCODE_$_CHARACTER = encodeURIComponent('$');
    TweekClient.ENCODE_SLASH_CHARACTER = encodeURIComponent('/');
    return TweekClient;
}());
exports.TweekClient = TweekClient;
function createTweekClient(baseServiceUrl, context, restGetter) {
    if (restGetter === void 0) { restGetter = function (url) { return fetch(url).then(function (r) { return r.json(); }); }; }
    return new TweekClient({
        baseServiceUrl: baseServiceUrl,
        casing: "camelCase",
        convertTyping: false,
        context: context,
        restGetter: restGetter
    });
}
exports.createTweekClient = createTweekClient;
//# sourceMappingURL=index.js.map
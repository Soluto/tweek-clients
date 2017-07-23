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
require("isomorphic-fetch");
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
        var _a = __assign({}, this.config, _config), casing = _a.casing, flatten = _a.flatten, baseServiceUrl = _a.baseServiceUrl, convertTyping = _a.convertTyping, context = _a.context, include = _a.include;
        var queryParamsObject = this._contextToQueryParams(context);
        if (flatten) {
            queryParamsObject['$flatten'] = true;
        }
        queryParamsObject['$include'] = include;
        var queryParams = queryString.stringify(queryParamsObject);
        queryParams = this.queryParamsEncoder(queryParams);
        var url = baseServiceUrl + '/api/v1/keys' + (path.startsWith('/') ? '' : '/') + path + (!!queryParams ? "?" + queryParams : '');
        var result = this.config.fetch(url).then(function (response) { return response.json(); });
        if (!flatten && casing === "camelCase") {
            result = result.then(snakeToCamelCase);
        }
        if (convertTyping) {
            result = result.then(convertTypingFromJSON);
        }
        return result;
    };
    TweekClient.prototype.appendContext = function (identityType, identityId, context) {
        var url = this.config.baseServiceUrl + "/api/v1/context/" + identityType + "/" + identityId;
        var result = this.config.fetch(url, { method: 'POST', body: context })
            .then(function (response) {
            if (!response.ok) {
                throw new Error("Error appending context, code " + response.status + ", message: '" + response.statusText + "'");
            }
        });
        return result;
    };
    TweekClient.prototype.deleteContext = function (identityType, identityId, property) {
        var url = this.config.baseServiceUrl + "/api/v1/context/" + identityType + "/" + identityId + "/" + property;
        var result = this.config.fetch(url, { method: 'DELETE' })
            .then(function (response) {
            if (!response.ok) {
                throw new Error("Error deleting context property, code " + response.status + ", message: '" + response.statusText + "'");
            }
        });
        return result;
    };
    TweekClient.ENCODE_$_CHARACTER = encodeURIComponent('$');
    TweekClient.ENCODE_SLASH_CHARACTER = encodeURIComponent('/');
    return TweekClient;
}());
exports.TweekClient = TweekClient;
function createTweekClient(baseServiceUrl, context) {
    return new TweekClient({
        baseServiceUrl: baseServiceUrl,
        casing: "camelCase",
        convertTyping: false,
        context: context,
        fetch: fetch,
    });
}
exports.createTweekClient = createTweekClient;
//# sourceMappingURL=index.js.map
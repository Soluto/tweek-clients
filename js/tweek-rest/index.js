/// <reference path="./node_modules/@types/isomorphic-fetch/index.d.ts"/>
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
function encodeContextUri(context) {
    return [context.type + "=" + context.id].concat(Object.keys(context).filter(function (x) { return x !== "id" && x !== "type"; })
        .map(function (prop) { return context.type + "." + prop + "=" + context[prop]; })).join("&");
}
var TweekClient = (function () {
    function TweekClient(config) {
        this.config = __assign({ camelCase: "snake", flatten: false, convertTyping: false, context: [] }, config);
    }
    TweekClient.prototype.fetch = function (path, _config) {
        var _a = __assign({}, this.config, _config), casing = _a.casing, flatten = _a.flatten, baseServiceUrl = _a.baseServiceUrl, restGetter = _a.restGetter, convertTyping = _a.convertTyping, context = _a.context;
        var url = baseServiceUrl + "/" + path + "?" + context.map(encodeContextUri).join("&");
        if (flatten) {
            url += "$flatten=true";
        }
        var result = restGetter(url);
        if (!flatten && casing === "camelCase") {
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

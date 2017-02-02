/// <reference path="./node_modules/@types/isomorphic-fetch/index.d.ts"/>
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
    return Object.keys(target).reduce((o, key) => {
        let [firstKey, ...others] = key.split("_");
        let newKey = [firstKey, ...others.map(captialize)].join("");
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
        return Object.keys(target).reduce((o, key) => {
            o[key] = convertTypingFromJSON(target[key]);
            return o;
        }, {});
    }
}
function encodeContextUri(context) {
    return [`${context.type}=${context.id}`, ...Object.keys(context).filter(x => x !== "id" && x !== "type")
            .map(prop => `${context.type}.${prop}=${context[prop]}`)].join("&");
}
export default class TweekClient {
    constructor(config) {
        this.config = __assign({ camelCase: "snake", flatten: false, convertTyping: false, context: [] }, config);
    }
    fetch(path, _config) {
        const { casing, flatten, baseServiceUrl, restGetter, convertTyping, context } = __assign({}, this.config, _config);
        let url = `${baseServiceUrl}/${path}?` + context.map(encodeContextUri).join("&");
        if (flatten) {
            url += "$flatten=true";
        }
        let result = restGetter(url);
        if (!flatten && casing === "camelCase") {
            result = result.then(snakeToCamelCase);
        }
        if (convertTyping) {
            result = result.then(convertTypingFromJSON);
        }
        return result;
    }
}
export function createTweekClient(baseServiceUrl, ...context) {
    return new TweekClient({ baseServiceUrl,
        casing: "camelCase",
        convertTyping: true,
        context,
        restGetter: (url) => fetch(url).then(x => x.json()) });
}
//# sourceMappingURL=index.js.map
/// <reference path="./node_modules/@types/isomorphic-fetch/index.d.ts"/>
import * as queryString from 'query-string';

export type IdentityContext = { id?: string; } & {
    [prop: string]: string;
}

export type Context = {
    [identityType: string]: IdentityContext
}

export type TweekCasing = "snake" | "camelCase";

export type TweekConfig = {
    casing: TweekCasing;
    convertTyping: boolean;
    flatten: boolean;
    context: Context;
}

export type TweekInitConfig = Partial<TweekConfig> & {
    baseServiceUrl: string;
    restGetter: <T>(url: string) => Promise<T>;
}

export type TweekFullConfig = TweekConfig & TweekInitConfig;

function captialize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function snakeToCamelCase(target) {
    if (typeof (target) !== "object") return target;
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
        } catch (e) {
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

export interface ITweekClient {
    fetch<T>(keys: string[], config?: Partial<TweekConfig>): Promise<T>;
}

export class TweekClient implements ITweekClient {
    config: TweekFullConfig;

    private static ENCODE_$_CHARACTER = encodeURIComponent('$');
    private static ENCODE_SLASH_CHARACTER = encodeURIComponent('/');

    constructor(config: TweekInitConfig) {
        this.config = <TweekFullConfig>{ ...{ camelCase: "snake", flatten: false, convertTyping: false, context: {} }, ...config };
    }

    fetch<T>(keys: string[], _config?: Partial<TweekConfig>): Promise<T> {
        const { casing, flatten, baseServiceUrl, restGetter, convertTyping, context } =
            <TweekFullConfig>{ ...this.config, ..._config };

        let queryParamsObject = this._contextToQueryParams(context);

        if (flatten) {
            queryParamsObject['$flatten'] = true;
        }

        queryParamsObject['include'] = keys;
        let queryParams = queryString.stringify(queryParamsObject);
        queryParams = queryParams.replace('$', TweekClient.ENCODE_$_CHARACTER);
        queryParams = queryParams.replace('/', TweekClient.ENCODE_SLASH_CHARACTER);

        const url = baseServiceUrl + (!!queryParams ? `?${queryParams}` : '');
        let result = restGetter<any>(url);

        if (!flatten && casing === "camelCase") {
            result = result.then(snakeToCamelCase);
        }

        if (convertTyping) {
            result = result.then(convertTypingFromJSON);
        }

        return <Promise<T>>result;
    }

    private _contextToQueryParams = context =>
        Object.keys(context).reduce((pre, cur) => {
            let identityContext = context[cur];
            Object.keys(identityContext).forEach(x => pre[`${cur}.${x}`] = identityContext[x]);
            return pre;
        }, {});
}

export function createTweekClient(baseServiceUrl: string,
    context: any,
    restGetter: <T>(url: string) => Promise<T> = <T>(url: string) => fetch(url).then(r => r.json<T>())) {
    return new TweekClient({
        baseServiceUrl,
        casing: "camelCase",
        convertTyping: true,
        context,
        restGetter
    });
}

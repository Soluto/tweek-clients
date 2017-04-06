
import * as queryString from 'query-string';

declare function fetch(x: any): Promise<{ json: <T>() => Promise<T> }>

export type IdentityContext = { id?: string; } & {
    [prop: string]: string;
}

export type Context = {
    [identityType: string]: IdentityContext
}

export type TweekCasing = "snake" | "camelCase";

export type FetchConfig = {
    include?: string[],
    casing?: TweekCasing;
    convertTyping?: boolean;
    flatten?: boolean;
    context?: Context;
}

export type TweekInitConfig = FetchConfig & {
    baseServiceUrl: string;
    restGetter: <T>(url: string) => Promise<T>;
    restPoster: <T>(url: string) => Promise<T>;
}

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
    fetch<T>(path: string, config?: FetchConfig): Promise<T>;
}

export class TweekClient implements ITweekClient {
    config: TweekInitConfig;

    private static ENCODE_$_CHARACTER = encodeURIComponent('$');
    private static ENCODE_SLASH_CHARACTER = encodeURIComponent('/');

    constructor(config: TweekInitConfig) {
        this.config = <TweekInitConfig & FetchConfig>
            { ...{ camelCase: "snake", flatten: false, convertTyping: false, context: {} }, ...config };

        let { baseServiceUrl } = config;

        if (baseServiceUrl.endsWith('/')) {
            baseServiceUrl = baseServiceUrl.substr(0, baseServiceUrl.length - 1);
            this.config.baseServiceUrl = baseServiceUrl;
        }
    }

    dispatch(path: string, event: string): Promise<any> {
        if (!event) {
            throw 'Argument "event" must be set';
        }
        const queryParamsObject = this._contextToQueryParams(this.config.context);
        queryParamsObject['event'] = event;
        const queryParams = queryString.stringify(queryParamsObject);
        const url = [...this.config.baseServiceUrl.split("/"), 'funnel', path.split("/")].join("/") + (!!queryParams ? `?${queryParams}` : '');
        return this.config.restPoster<void>(url);
    }

    fetch<T>(path: string, _config?: FetchConfig): Promise<T> {
        const { casing, flatten, baseServiceUrl, restGetter, convertTyping, context, include } =
            <TweekInitConfig & FetchConfig>{ ...this.config, ..._config };
        let queryParamsObject = this._contextToQueryParams(context);

        if (flatten) {
            queryParamsObject['$flatten'] = true;
        }

        queryParamsObject['$include'] = include;
        let queryParams = queryString.stringify(queryParamsObject);
        queryParams = this.queryParamsEncoder(queryParams);

        const url = [...this.config.baseServiceUrl.split("/"), 'keys', path.split("/")].join("/") + (!!queryParams ? `?${queryParams}` : '');
        let result = restGetter<any>(url);

        if (!flatten && casing === "camelCase") {
            result = result.then(snakeToCamelCase);
        }

        if (convertTyping) {
            result = result.then(convertTypingFromJSON);
        }

        return <Promise<T>>result;
    }

    public queryParamsEncoder = (queryParams: string) => queryParams
        .replace(/\$/g, TweekClient.ENCODE_$_CHARACTER)
        .replace(/\//g, TweekClient.ENCODE_SLASH_CHARACTER);

    private _contextToQueryParams = context => {
        return Object.keys(context).reduce((pre, cur) => {
            let identityContext = context[cur];
            Object.keys(identityContext).forEach(x =>
                x === 'id' ? pre[`${cur}`] = identityContext[x] : pre[`${cur}.${x}`] = identityContext[x]);
            return pre;
        }, {});
    }
}

export function createTweekClient(baseServiceUrl: string,
    context: any,
    restGetter: <T>(url: string) => Promise<T> = <T>(url: string) => fetch(url).then(r => r.json<T>()),
    restPoster: <T>(url: string) => Promise<T> = <T>(url: string) => fetch({ url, params: { method: 'POST' } })) {
    return new TweekClient({
        baseServiceUrl,
        casing: "camelCase",
        convertTyping: true,
        context,
        restGetter,
        restPoster
    });
}

/// <reference path="../node_modules/@types/isomorphic-fetch/index.d.ts" />
/// <reference types="es6-shim" />
export declare type Identity = {
    type: string;
    id: string;
};
export declare type IdentityContext = Identity & {
    [prop: string]: string;
};
export declare type TweekCasing = "snake" | "camelCase";
export declare type TweekConfig = {
    casing: TweekCasing;
    convertTyping: boolean;
    flatten: boolean;
    context: IdentityContext[];
};
export declare type TweekInitConfig = Partial<TweekConfig> & {
    baseServiceUrl: string;
    restGetter: <T>(url) => Promise<T>;
};
export default class TweekClient {
    config: TweekInitConfig;
    constructor(config: TweekInitConfig);
    fetch<T>(path: string, _config?: Partial<TweekConfig>): Promise<T>;
}
export declare function createTweekClient(baseServiceUrl: string, ...context: IdentityContext[]): TweekClient;

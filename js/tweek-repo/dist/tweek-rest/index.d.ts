/// <reference path="../../../tweek-rest/node_modules/@types/isomorphic-fetch/index.d.ts" />
export declare type IdentityContext = {
    id?: string;
} & {
    [prop: string]: string;
};
export declare type Context = {
    [identityType: string]: IdentityContext;
};
export declare type TweekCasing = "snake" | "camelCase";
export declare type TweekConfig = {
    casing: TweekCasing;
    convertTyping: boolean;
    flatten: boolean;
    context: Context;
};
export declare type TweekInitConfig = Partial<TweekConfig> & {
    baseServiceUrl: string;
    restGetter: <T>(url: string) => Promise<T>;
};
export declare type TweekFullConfig = TweekConfig & TweekInitConfig;
export interface ITweekClient {
    fetch<T>(keys: string[], config?: Partial<TweekConfig>): Promise<T>;
}
export declare class TweekClient implements ITweekClient {
    config: TweekFullConfig;
    private static ENCODE_$_CHARACTER;
    private static ENCODE_SLASH_CHARACTER;
    constructor(config: TweekInitConfig);
    fetch<T>(keys: string[], _config?: Partial<TweekConfig>): Promise<T>;
    private _contextToQueryParams;
}
export declare function createTweekClient(baseServiceUrl: string, context: any, restGetter?: <T>(url: string) => Promise<T>): TweekClient;

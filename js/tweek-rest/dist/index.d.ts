/// <reference path="../node_modules/@types/isomorphic-fetch/index.d.ts" />
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
    restGetter: <T>(url) => Promise<T>;
};
export declare type TweekFullConfig = TweekConfig & TweekInitConfig;
export default class TweekClient {
    config: TweekFullConfig;
    constructor(config: TweekInitConfig);
    fetch<T>(path: string, _config?: Partial<TweekConfig>): Promise<T>;
}
export declare function createTweekClient(baseServiceUrl: string, context: any, restGetter?: <T>(url: any) => Promise<T>): TweekClient;

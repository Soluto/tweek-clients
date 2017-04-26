export declare type IdentityContext = {
    id?: string;
} & {
    [prop: string]: string;
};
export declare type Context = {
    [identityType: string]: IdentityContext;
};
export declare type TweekCasing = "snake" | "camelCase";
export declare type FetchConfig = {
    include?: string[];
    casing?: TweekCasing;
    convertTyping?: boolean;
    flatten?: boolean;
    context?: Context;
};
export declare type TweekInitConfig = FetchConfig & {
    baseServiceUrl: string;
    restGetter: <T>(url: string) => Promise<T>;
};
export interface ITweekClient {
    fetch<T>(path: string, config?: FetchConfig): Promise<T>;
}
export declare class TweekClient implements ITweekClient {
    config: TweekInitConfig;
    private static ENCODE_$_CHARACTER;
    private static ENCODE_SLASH_CHARACTER;
    constructor(config: TweekInitConfig);
    fetch<T>(path: string, _config?: FetchConfig): Promise<T>;
    queryParamsEncoder: (queryParams: string) => string;
    private _contextToQueryParams;
}
export declare function createTweekClient(baseServiceUrl: string, context: any, restGetter?: <T>(url: string) => Promise<T>): TweekClient;

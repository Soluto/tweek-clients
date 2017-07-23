import 'isomorphic-fetch';
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
    fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};
export interface ITweekClient {
    fetch<T>(path: string, config?: FetchConfig): Promise<T>;
    appendContext(identityType: string, identityId: string, context: object): Promise<void>;
    deleteContext(identityType: string, identityId: string, property: string): Promise<void>;
}
export declare class TweekClient implements ITweekClient {
    config: TweekInitConfig;
    private static ENCODE_$_CHARACTER;
    private static ENCODE_SLASH_CHARACTER;
    constructor(config: TweekInitConfig);
    fetch<T>(path: string, _config?: FetchConfig): Promise<T>;
    appendContext(identityType: string, identityId: string, context: object): Promise<void>;
    deleteContext(identityType: string, identityId: string, property: string): Promise<void>;
    queryParamsEncoder: (queryParams: string) => string;
    private _contextToQueryParams;
}
export declare function createTweekClient(baseServiceUrl: string, context: any): TweekClient;

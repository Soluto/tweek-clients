/// <reference types="es6-shim" />
export declare type IdentityContext = {
    type: string;
    id: string;
    [prop: string]: string;
};
export declare type TweekConfig = {
    baseServiceUrl: string;
    casing: "snake" | "camelCase";
    restGetter: <T>(url) => Promise<T>;
    convertTyping: boolean;
    context: IdentityContext[];
};
export default class TweekClient {
    config: TweekConfig;
    constructor(config: TweekConfig);
    fetch<T>(path: string, _config?: {}): Promise<T>;
}
export declare function createTweekClient(baseServiceUrl: string, ...context: IdentityContext[]): TweekClient;

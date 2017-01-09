/// <reference types="es6-shim" />
export interface TweekConfig {
    baseServiceUrl: string;
    casing: "snake" | "camelCase";
    restGetter: <T>(url) => Promise<T>;
    convertTyping: boolean;
}
export default class TweekClient {
    config: TweekConfig;
    constructor(config: TweekConfig);
    fetch<T>(path: string, _config?: {}): Promise<T>;
}
export declare function createTweekClient(baseServiceUrl: string): TweekClient;

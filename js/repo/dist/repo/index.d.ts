/// <reference types="core-js" />
import TweekClient from '../rest';
export declare type KeyCollection = {
    [key: string]: any;
};
export declare const TweekKeySplitJoin: {
    split: (key: string) => string[];
    join: (fragments: string[]) => string;
};
export declare type TweekRepositoryConfig = {
    client: TweekClient;
    keys?: KeyCollection;
};
export declare type ConfigurationLocation = "local" | "remote";
export default class TweekRepository {
    private _cache;
    private _client;
    constructor({client, keys}: TweekRepositoryConfig);
    expire(key: string): void;
    get(key: string): Promise<any> | undefined;
    private _extractScanResult(key);
    private addScanNodes(prefix, entries);
    private _refreshKey(key);
    private refresh();
}

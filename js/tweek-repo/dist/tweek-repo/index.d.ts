import TweekClient, { Context } from '../tweek-rest';
import Optional from "./optional";
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
    context: Context;
    constructor({client, keys}: TweekRepositoryConfig);
    prepare(key: string): void;
    get(key: string): Promise<never | Optional<any> | any>;
    private _extractScanResult(key);
    private setScanNodes(prefix, entries, state);
    private updateNode(key, node, value);
    private _refreshKey(key);
    refresh(): Promise<any>;
}

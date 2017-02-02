import TweekClient from '../tweek-rest';
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
    prepare(key: string): void;
    get(key: string): Promise<any> | undefined;
    private _extractScanResult(key);
    private setScanNodes(prefix, entries, state);
    private updateNode(key, node, value);
    private _refreshKey(key);
    refresh(): Promise<any>;
}

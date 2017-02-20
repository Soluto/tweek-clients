import { ITweekClient, Context } from '../tweek-rest';
import Optional from "./optional";
export declare type KeyCollection = {
    [key: string]: any;
};
export declare const TweekKeySplitJoin: {
    split: (key: string) => string[];
    join: (fragments: string[]) => string;
};
export interface TweekStore {
    save: (keys: KeyCollection) => Promise<void>;
    load: () => Promise<KeyCollection>;
}
export declare type TweekRepositoryConfig = {
    client: ITweekClient;
    store: TweekStore;
};
export declare type ConfigurationLocation = "local" | "remote";
export declare class MemoryStore implements TweekStore {
    _keys: any;
    constructor(initialKeys?: {});
    save(keys: any): Promise<void>;
    load(): Promise<any>;
}
export default class TweekRepository {
    private _cache;
    private _store;
    private _client;
    context: Context;
    constructor({client, store}: TweekRepositoryConfig);
    init(): Promise<void>;
    prepare(key: string): void;
    get(key: string): Promise<never | Optional<any> | any>;
    refresh(): Promise<any>;
    private _refreshKeys(keys);
    private _updateTrieKey(key, config);
    private _updateTrieKeys(keys, config);
    private _extractScanResult(key);
    private setScanNodes(prefix, keys, state);
    private updateNode(key, node, value);
    private _persist(config);
}

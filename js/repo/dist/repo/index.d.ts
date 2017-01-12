import TweekClient from '../rest';
export declare type KeyCollection = {
    [key: string]: any;
};
export declare const TweekKeySplitJoin: {
    split: (key: string) => string[];
    join: (fragments: string[]) => string;
};
export declare class TweekRepository {
    client: TweekClient;
    private _cache;
    constructor(client: TweekClient, keys?: KeyCollection);
    prepare(key: string): void;
    get(): void;
    refresh(): void;
}

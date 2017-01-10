export declare type KeyCollection = {
    [key: string]: any;
};
export declare const TweekKeySplitJoin: {
    split: (key: string) => string[];
    join: (fragments: string[]) => string;
};
export declare class TweekRepository {
    private _cache;
    constructor(keys: KeyCollection);
    refresh(): void;
}

export declare type ValueNode<TValue> = any;
export declare type TrieNode<TValue> = ValueNode<TValue> | {
    [key: string]: TrieNode<TValue>;
};
export declare type SplitJoin = {
    split: (key: string) => string[];
    join: (fragments: string[]) => string;
};
export default class Trie<TValue> {
    private _splitJoin;
    constructor(_splitJoin: SplitJoin);
    private _root;
    private _valueMap;
    set(key: string, value: TValue): void;
    get(key: string): TValue | undefined;
    listRelative(key: string): {
        [key: string]: TValue;
    };
    list(key?: string, index?: number): {
        [key: string]: TValue;
    };
}

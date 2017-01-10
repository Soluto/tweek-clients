export declare type TrieNode<TValue> = any | {
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
    add(key: string, value: TValue): void;
    get(key: string): TrieNode<TValue> | null;
    listRelative(key: string): {
        [key: string]: TValue;
    };
    list(key: string, index?: number): {
        [key: string]: TValue;
    };
}

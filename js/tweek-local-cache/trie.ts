export type ValueNode<TValue> = any;

export type TrieNode<TValue> = ValueNode<TValue> | { [key: string]: TrieNode<TValue>; }
export type SplitJoin = {
    split: (key: string) => string[];
    join: (fragments: string[]) => string;
}

export default class Trie<TValue>{
    constructor(private _splitJoin: SplitJoin) { }

    private _root: TrieNode<TValue> = {};
    private _valueMap = new WeakMap<Node, TValue>();

    set(key: string, value: TValue) {
        const fragments = this._splitJoin.split(key);
        let node = fragments.reduce((acc, next) => {
            if (!acc[next]) { acc[next] = {} }
            return acc[next];
        }, this._root);
        this._valueMap.set(node, value);
    }

    get(key: string): TValue | undefined {
        const fragments = this._splitJoin.split(key);
        let node = fragments.reduce((acc, next) => {
            if (!acc) return null;
            return acc[next];
        }, this._root);
        return node && this._valueMap.get(node);
    }

    listRelative(key: string) {
        const fragments = this._splitJoin.split(key);
        return this.list(key, fragments.length);
    }

    list(key?: string, index = 0): { [key: string]: TValue } {
        const fragments = key && this._splitJoin.split(key) || [];
        let node = fragments.reduce((acc, next) => {
            if (!acc) return null;
            return acc[next];
        }, this._root);

        if (node === null || node === undefined) return {};

        const initialValue = this._valueMap.has(node) ? {
            [this._splitJoin.join(fragments.slice(index))]: <TValue>this._valueMap.get(node),
        } : {};

        return Object.keys(node)
            .map(name => this.list(this._splitJoin.join([...fragments, name]), index))
            .reduce((acc, next) => ({...acc, ...next}), initialValue);
    }
}

import { SplitJoin } from './split-join';

export type TrieNode = { [key: string]: TrieNode | undefined };

export default class Trie<TValue> {
  constructor(private readonly _splitJoin: SplitJoin) {}

  private readonly _root: TrieNode = {};
  private readonly _valueMap = new WeakMap<TrieNode, TValue>();

  static from<T>(splitJoin: SplitJoin, values: { [key: string]: T }) {
    const trie = new Trie<T>(splitJoin);

    for (const [k, v] of Object.entries(values)) {
      trie.set(k, v);
    }

    return trie;
  }

  set(key: string, value: TValue) {
    const fragments = this._splitJoin.split(key);
    const node = this._getNode(fragments, true);
    this._valueMap.set(node, value);
  }

  get(key: string): TValue | undefined {
    const fragments = this._splitJoin.split(key);
    const node = this._getNode(fragments);
    return node && this._valueMap.get(node);
  }

  listRelative(key: string) {
    const fragments = this._splitJoin.split(key);
    return this.list(key, fragments.length);
  }

  list(key?: string, index = 0): { [key: string]: TValue } {
    const fragments = (key && this._splitJoin.split(key)) || [];
    const node = this._getNode(fragments);
    if (!node) {
      return {};
    }

    const result = this._valueMap.has(node)
      ? {
          [this._splitJoin.join(fragments.slice(index))]: <TValue>this._valueMap.get(node),
        }
      : {};

    for (const name of Object.keys(node)) {
      const relative = this.list(this._splitJoin.join([...fragments, name]), index);
      Object.assign(result, relative);
    }

    return result;
  }

  listEntries(key?: string, index = 0): string[] {
    const fragments = (key && this._splitJoin.split(key)) || [];
    const node = this._getNode(fragments);
    if (!node) {
      return [];
    }

    const result = [];
    if (this._valueMap.has(node)) {
      result.push(this._splitJoin.join(fragments.slice(index)));
    }

    for (const name of Object.keys(node)) {
      const subKey = this._splitJoin.join([...fragments, name]);
      Array.prototype.push.apply(result, this.listEntries(subKey, index));
    }

    return result;
  }

  private _getNode(fragments: string[]): TrieNode | undefined;
  private _getNode(fragments: string[], force: true): TrieNode;
  private _getNode(fragments: string[], force?: boolean): TrieNode | undefined {
    let node = this._root;
    for (const next of fragments) {
      let nextNode = node[next];
      if (!nextNode) {
        if (!force) {
          return undefined;
        }
        nextNode = {};
        node[next] = nextNode;
      }
      node = nextNode;
    }

    return node;
  }
}

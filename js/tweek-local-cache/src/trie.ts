import { SplitJoin } from './split-join';

export type TrieNode = { [key: string]: TrieNode };

export type Walker<TValue> = (key: string, value: TValue) => void;

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
    const result: { [key: string]: TValue } = {};
    this.walk((key, value) => (result[key] = value), key, index);
    return result;
  }

  listEntries(key?: string, index = 0): string[] {
    const result: string[] = [];
    this.walk(key => result.push(key), key, index);
    return result;
  }

  walk(walker: Walker<TValue>, key?: string, index = 0) {
    const fragments = (key && this._splitJoin.split(key)) || [];
    const node = this._getNode(fragments);
    if (!node) {
      return;
    }

    this._walkNode(node, fragments.slice(index), walker);
  }

  private _walkNode(node: TrieNode, fragments: string[], walker: Walker<TValue>) {
    if (this._valueMap.has(node)) {
      walker(this._splitJoin.join(fragments), this._valueMap.get(node)!);
    }

    for (const [name, subNode] of Object.entries(node)) {
      this._walkNode(subNode, [...fragments, name], walker);
    }
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

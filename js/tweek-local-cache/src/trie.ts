import { SplitJoin } from './split-join';

export type TrieNode<TValue> = TValue | { [key: string]: TrieNode<TValue> };

export default class Trie<TValue> {
  constructor(private readonly _splitJoin: SplitJoin) {}

  private readonly _root: TrieNode<TValue> = {};
  private readonly _valueMap = new WeakMap<{}, TValue>();

  static from<T>(splitJoin: SplitJoin, values: { [key: string]: T }) {
    const trie = new Trie<T>(splitJoin);

    for (const [k, v] of Object.entries(values)) {
      trie.set(k, v);
    }

    return trie;
  }

  set(key: string, value: TValue) {
    const fragments = this._splitJoin.split(key);
    let node: any = this._root;
    for (const next of fragments) {
      let nextNode = node[next];
      if (!nextNode) {
        nextNode = {};
        node[next] = nextNode;
      }
      node = nextNode;
    }
    this._valueMap.set(node, value);
  }

  get(key: string): TValue | undefined {
    const fragments = this._splitJoin.split(key);
    let node: any = this._root;

    for (const next of fragments) {
      node = node[next];
      if (!node) {
        return undefined;
      }
    }

    return this._valueMap.get(node);
  }

  listRelative(key: string) {
    const fragments = this._splitJoin.split(key);
    return this.list(key, fragments.length);
  }

  list(key?: string, index = 0): { [key: string]: TValue } {
    const fragments = (key && this._splitJoin.split(key)) || [];
    let node: any = this._root;
    for (const next of fragments) {
      node = node[next];
      if (!node) {
        return {};
      }
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

  listEntries(key?: string): string[] {
    const fragments = (key && this._splitJoin.split(key)) || [];
    let node: any = this._root;

    for (const next of fragments) {
      node = node[next];
      if (!node) {
        return [];
      }
    }

    const result = [];
    if (key && this._valueMap.has(node)) {
      result.push(key);
    }

    for (const name of Object.keys(node)) {
      const subKey = this._splitJoin.join([...fragments, name]);
      Array.prototype.push.apply(result, this.listEntries(subKey));
    }

    return result;
  }
}

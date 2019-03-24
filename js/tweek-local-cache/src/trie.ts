import { flatMap } from './utils';
import { SplitJoin } from './split-join';

export type TrieNode<TValue> = TValue | { [key: string]: TrieNode<TValue> };

export default class Trie<TValue> {
  constructor(private readonly _splitJoin: SplitJoin) {}

  private readonly _root: TrieNode<TValue> = {};
  private readonly _valueMap = new WeakMap<{}, TValue>();

  static from<T>(splitJoin: SplitJoin, values: { [key: string]: T }) {
    const trie = new Trie<T>(splitJoin);

    Object.entries(values).forEach(([k, v]) => {
      trie.set(k, v);
    });

    return trie;
  }

  set(key: string, value: TValue) {
    const fragments = this._splitJoin.split(key);
    const node = fragments.reduce((acc: any, next) => {
      if (!acc[next]) {
        acc[next] = {};
      }
      return acc[next];
    }, this._root);
    this._valueMap.set(node, value);
  }

  get(key: string): TValue | undefined {
    const fragments = this._splitJoin.split(key);
    const node = fragments.reduce((acc: any, next) => {
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
    const fragments = (key && this._splitJoin.split(key)) || [];
    const node = fragments.reduce((acc: any, next) => {
      if (!acc) return null;
      return acc[next];
    }, this._root);

    if (node === null || node === undefined) return {};

    const initialValue = this._valueMap.has(node)
      ? {
          [this._splitJoin.join(fragments.slice(index))]: <TValue>this._valueMap.get(node),
        }
      : {};

    return Object.keys(node)
      .map(name => this.list(this._splitJoin.join([...fragments, name]), index))
      .reduce((acc, next) => ({ ...acc, ...next }), initialValue);
  }

  listEntries(key?: string): string[] {
    const fragments = (key && this._splitJoin.split(key)) || [];
    const node = fragments.reduce((acc: any, next) => {
      if (!acc) return null;
      return acc[next];
    }, this._root);

    if (node === null || node === undefined) return [];

    return flatMap(Object.keys(node), name => {
      const subKey = this._splitJoin.join([...fragments, name]);
      const subEntries = this.listEntries(subKey);
      subEntries.push(subKey);
      return subEntries;
    });
  }
}

export type TrieNode<TValue> = TValue | {[key:string]: TrieNode<TValue>}

export type SplitJoin = {
    split: (key:string)=> string[];
    join: (fragments:string[]) => string;
}

export default class Trie<TValue>{
    constructor(private _splitJoin: SplitJoin){}
    
    private _root: TrieNode<TValue>;
    
    add(key:string, value:TValue){
       const fragments = this._splitJoin.split(key);
       let node = fragments.slice( -(fragments.length-1)).reduce((acc, next)=>{
           if (!acc[next]) {acc[next] = {}}
           return acc[next];
       }, this._root);
       let keyName = node[fragments.slice(-1)[0]];
       node[keyName] = value;
    }

    get(key:string):TrieNode<TValue> | null{
       const fragments = this._splitJoin.split(key);
       return fragments.reduce((acc, next)=>{
           if (!acc) return null;
           return acc[next];
       }, this._root);
    }
}

const val = Symbol();

export type TrieNode<TValue> = any | {[key:string]: TrieNode<TValue>;} 
export type SplitJoin = {
    split: (key:string)=> string[];
    join: (fragments:string[]) => string;
}


export default class Trie<TValue>{
    constructor(private _splitJoin: SplitJoin){}
    
    private _root: TrieNode<TValue> = {};
    
    add(key:string, value:TValue){
       const fragments = this._splitJoin.split(key);
       let node = fragments.reduce((acc, next)=>{
           if (!acc[next]) {acc[next] = {}}
           return acc[next];
       }, this._root);
       node[val] = value;
    }

    get(key:string):TrieNode<TValue> | null{
       const fragments = this._splitJoin.split(key);
       return fragments.reduce((acc, next)=>{
           if (!acc) return null;
           return acc[next];
       }, this._root)[val];
    }

    listRelative(key:string){
       const fragments = this._splitJoin.split(key);
       return this.list(key, fragments.length); 
    }

    list(key:string, index=0): {[key:string]:TValue }{
       const fragments = this._splitJoin.split(key);
       let node = fragments.reduce((acc, next)=>{
           if (!acc) return null;
           return acc[next];
       }, this._root);
       let results = [
           ...[
               ...Object.keys(node)
           .map(name=> this.list(this._splitJoin.join([...fragments,name]), index))
           ]
       ].reduce((acc,next)=>({...acc,...next}), node[val] ? {
           [this._splitJoin.join(fragments.slice(index))]: node[val]
       } : {});
       return results;
    }

}
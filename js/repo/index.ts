
type KeyCollection = {
   [key:string]:string;
}


type TrieNode<TValue> = TValue | {[key:string]: TrieNode<TValue>}

type SplitJoin = {
    split: (key:string)=> string[];
    joint: (fragments:string[]) => string;
}


const TweekKeySplitJoin = {
    split: (key:string)=> key.split("/"),
    join: (fragments:string[]) => fragments.join("/")
}

class Trie<TValue>{
    constructor(private _splitJoin: SplitJoin){}
    
    _root: TrieNode<TValue>;
    
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

export class KeyTrie {


}


export class TweekRepository{
    constructor(KeyCollection){

    }


    

}
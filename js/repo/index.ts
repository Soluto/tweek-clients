import Trie from './trie';

export type KeyCollection = {
   [key:string]:any;
}


export const TweekKeySplitJoin = {
    split: (key:string)=> key.split("/"),
    join: (fragments:string[]) => fragments.join("/")
}

type MissingKey = {
    state:"missing",
    requested_ttl:number;
}
type CachedKey<T> = {
    state:"offline",
    value: T;
}
type DownloadedKey<T> = CachedKey<T> & {
    state:"downloaded";
    lastUpdated: Date;
    ttl:number;
}

type RepositoryKey<T> = MissingKey | CachedKey<T> | DownloadedKey<T>;

export class TweekRepository{
    private _cache = new Trie<RepositoryKey<any>>(TweekKeySplitJoin);
    constructor(keys:KeyCollection){
        Object.keys(keys).forEach(k=> this._cache.add(k, {
            state:"offline",
            value: keys[k]
        }));
    }
    refresh(){
        
    }



}
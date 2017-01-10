import Trie from './trie';
import TweekClient from '../rest'

export type KeyCollection = {
   [key:string]:any;
}

export const TweekKeySplitJoin = {
    split: (key:string)=> key.split("/"),
    join: (fragments:string[]) => fragments.join("/")
}

type RequestedKey = {
    state:"requested",
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

type RepositoryKey<T> = RequestedKey | CachedKey<T> | DownloadedKey<T>;

export class TweekRepository{
    private _cache = new Trie<RepositoryKey<any>>(TweekKeySplitJoin);
    constructor(public client:TweekClient, keys?:KeyCollection){
        Object.keys(keys).forEach(k=> this._cache.add(k, {
            state:"offline",
            value: keys[k]
        }));
    }
    refresh(){
        
    }
}
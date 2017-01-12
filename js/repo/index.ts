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
    requested_ttl?:number;
}

type CachedKey<T> = {
    state:"offline",
    value: ()=>T;
}

type DownloadedKey<T> = Pick<CachedKey<T>, "value"> & {
    state:"downloaded";
    lastUpdated: Date;
    ttl:number;
}

type RepositoryKey<T> =  CachedKey<T> | DownloadedKey<T> | RequestedKey;

export type TweekRepositoryConfig = {
    client:TweekClient;
    ttl?:number;
    keys?:KeyCollection;
}

export class TweekRepository{
    private _cache = new Trie<RepositoryKey<any>>(TweekKeySplitJoin);
    private _client:TweekClient;
    private _ttl:number;

    constructor({client, keys={}, ttl=12}:TweekRepositoryConfig){
        this._client = client;
        this._ttl = ttl;
        Object.entries(keys).forEach(([key, value])=> this._cache.set(key, {
            state:"offline",
            value: value
        }));
    }

    prepare(key:string, ttl?:number){
        let node = this._cache.get(key);
        if (node === null){
            this._cache.set(key, {state:"requested", requested_ttl: ttl})
            return;
        }
        if (node.state === "offline") return;
        if (node.state === "downloaded"){
            //update ttl;
        }
    }
    
    private _refreshKey(key:string, node:RepositoryKey<any>, ttl?:number){
        let isScan = key.slice(-1) === "_";
        this._client.fetch<string>(key, {flatten:true, casing:"camelCase"} )
        .then(config =>{
            if (!isScan)
            {
                this._cache.set(key, {
                    state: "downloaded",
                    value: ()=>config,
                    lastUpdated: new Date(),
                    ttl: ttl || this._ttl
                })
            }
            else{
                this._cache.set(key, {
                    state: "downloaded",
                    value: ()=>config,
                    lastUpdated: new Date(),
                    ttl: ttl || this._ttl
                })
            }
            
        });

    }

    refresh(){
        for (let [key, cacheNode] of  <[string, RepositoryKey<any>][]>Object.entries(this._cache.list())   ){
            if (cacheNode.state === "offline"){
                
            }

        };
    }
}
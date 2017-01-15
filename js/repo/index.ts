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

export type ConfigurationLocation = "local" | "remote";

export type GetOptions= {
    location: ConfigurationLocation[];
    allowExpiredValues: boolean
}

let isExpired = (node: DownloadedKey<any>)=> {
    return new Date().getTime() - node.lastUpdated.getTime() > node.ttl;
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
        if (node.state === "downloaded" ){
            //update ttl;
        }
    }

    _get(){}

    get(key:string, options:GetOptions = {location:["local"], allowExpiredValues:true}){
        let location = options.location[0];
        let fallback = ()=> options.location.length ? this.get(key, {location: options.location.slice(1),
            allowExpiredValues: options.allowExpiredValues}) : Promise.reject("no value was found");

        if (location === "remote"){
            this._refreshKey().then(()=>{
                
            })
        }
        if (location === "local"){
            
            let node = this._cache.get(key);
            if (!node) return fallback();
            if (node.state === "requested") return fallback();
            if (options.allowExpiredValues){
                return Promise.resolve(node.value());
            }
            else{
                if (node.state === "offline" || isExpired(node)){
                    return fallback();
                }
                return Promise.resolve(node.value());
            }
        }
        
    }
    
    private _refreshKey(key:string, node:RepositoryKey<any>, ttl?:number){
        let isScan = key.slice(-1) === "_";
        return this._client.fetch<string>(key, {flatten:true, casing:"camelCase"} )
        .then(config =>{
            let node:DownloadedKey<any> = {
                    state: "downloaded",
                    value: ()=>config,
                    lastUpdated: new Date(),
                    ttl: ttl || this._ttl
                };
            this._cache.set(key, node);
            return node.value();
        });

    }

    refresh(){
        for (let [key, cacheNode] of  <[string, RepositoryKey<any>][]>Object.entries(this._cache.list())   ){
            if (cacheNode.state === "offline"){
                
            }

        };
    }
}
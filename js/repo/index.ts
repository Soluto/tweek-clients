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
    state:"requested"
}

type CachedKey<T> = {
    state:"cached";
    value: T;
    isScan:false;
    isExpired:boolean;
}

type ScanNode = {
    state:"cached";
    isScan: true;
    isExpired:boolean;
}

type RepositoryKey<T> =  CachedKey<T> | RequestedKey | ScanNode;

export type TweekRepositoryConfig = {
    client:TweekClient;
    keys?:KeyCollection;
}

export type ConfigurationLocation = "local" | "remote";

export class TweekRepository{
    private _cache = new Trie<RepositoryKey<any>>(TweekKeySplitJoin);
    private _client:TweekClient;

    constructor({client, keys={}}:TweekRepositoryConfig){
        this._client = client;
        Object.entries(keys).forEach(([key, value])=> this._cache.set(key, {
            state:"cached",
            isScan:false,
            value: value,
            isExpired:true
        }));
    }

    expire(key:string){
        let node = this._cache.get(key);
        if (node === null){
            this._cache.set(key, {state:"requested"})
            return;
        }
        if (node.state === "cached" ){
            node.isExpired = true;
        }
    }

    get(key:string){
        let isScan = key.slice(-1) === "_";
        let node = this._cache.get(key);
        if (isScan && !node){
            return Promise.resolve(this._extractScanResult(key));
        }
        if (!node) return;
        if (node.state === "requested") return Promise.reject("value not available");
        if (!node.isScan) return Promise.resolve(node.value);
    }
    
    private _extractScanResult(key){
        let prefix = key.replace("/_", "");
        return this._cache.listRelative(prefix);
    }
    
    private _refreshKey(key:string){
        let isScan = key.slice(-1) === "_";
        return this._client.fetch<any>(key, {flatten:true, casing:"camelCase"} )
        .then(config =>{
            if (isScan){
                let prefix = key.replace("/_", '');
                
                Object.entries(config).forEach(([subKey, value])=>{
                    this._cache.set(`${prefix}/${subKey}`, {
                    state: "cached",
                    isExpired:false,
                    isScan:false,
                    value: ()=>value
                    });
                })

                this._cache.set(key, {
                    state: "cached",
                    isScan:true,
                    isExpired:false
                });
            }
            else{
                this._cache.set(key, {
                    state: "cached",
                    isScan:false,
                    isExpired:false,
                    value: ()=>config
                });
            }
        });
    }

    private refresh(){
        for (let [key, cacheNode] of  <[string, RepositoryKey<any>][]>Object.entries(this._cache.list())   ){
            if (cacheNode.state === "requested" || cacheNode.isExpired ){
                this._refreshKey("_");
                return;
            }
        };
    }
}
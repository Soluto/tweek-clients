import Trie from './trie';
import TweekClient from '../rest';
import {partitionByIndex, snakeToCamelCase, distinct} from './utils';
import e = require("object.entries");
e.shim();

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
    scheduler?: Scheduler;
}

export type Scheduler = (fn:()=>void)=>void;

export type ConfigurationLocation = "local" | "remote";

let getKeyPrefix = (key) => partitionByIndex(key.split("/"), -1)[0].join("/");

export default class TweekRepository{
    private _cache = new Trie<RepositoryKey<any>>(TweekKeySplitJoin);
    private _client:TweekClient;
    private _scheduler: Scheduler;

    constructor({client, keys={}, scheduler=setImmediate}:TweekRepositoryConfig){
        this._client = client;
        this._scheduler = scheduler;
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
        this._scheduler(()=>this.refresh());
    }

    get(key:string){
        let isScan = key.slice(-1) === "_";
        if (isScan){
            return Promise.resolve(this._extractScanResult(key));
        }
        let node = this._cache.get(key);
        if (!node) return Promise.reject("key not managed, use expire to add it to cache");
        if (node.state === "requested") return Promise.reject("value not available");
        if (!node.isScan) return Promise.resolve(node.value);
    }
    
    private _extractScanResult(key){
        let prefix = getKeyPrefix(key);
        return Object.entries(this._cache.listRelative(prefix))
        .filter(([key, value])=> value.state === "cached" && !value.isScan )
        .reduce((acc, [key, value])=>{
            let [fragments, [name]] = partitionByIndex(key.split("/").map(snakeToCamelCase), -1);
            let node = fragments.reduce((node, fragment)=>{
                if (!acc[fragment]){
                    acc[fragment] = {};
                }
                return acc[fragment];
            }, acc);
            node[name] = value.value;
            return acc;
        }, {});
    }

    private addScanNodes(prefix, entries){
        distinct(entries.map(([key, _])=> getKeyPrefix(key)))
               .map(dir=> [...(prefix ==="" ? [] : [prefix]), dir, "_"].join("/") )
               .forEach(key=> this._cache.set(key, {
                    state: "cached",
                    isScan:true,
                    isExpired:false
               }));
    }
    
    private _refreshKey(key:string){
        let isScan = key.slice(-1) === "_";
        return this._client.fetch<any>(key, {flatten:true, casing:"snake"} )
        .then(config =>{
            if (isScan){
                let prefix = getKeyPrefix(key);
                let entries = Object.entries(config);
                entries.forEach(([subKey, value])=>{
                    let k = [...(prefix ==="" ? [] : [prefix]), subKey].join("/");
                    this._cache.set(k, {
                    state: "cached",
                    isExpired:false,
                    isScan:false,
                    value
                    });
                });
                this.addScanNodes(prefix, entries);
            }
            else{
                this._cache.set(key, {
                    state: "cached",
                    isScan:false,
                    isExpired:false,
                    value: config
                });
            }
        });
    }

    private refresh(){
        let keys =  <[string, RepositoryKey<any>][]>Object.entries(this._cache.list());
        if (keys.some( ([key, cachenode])=> cachenode.state === "requested" || cachenode.isExpired )){
            this._refreshKey("_");
        }
    }
}
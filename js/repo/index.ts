import Trie from './trie';
import TweekClient from '../rest';
import {partitionByIndex, snakeToCamelCase, distinct} from './utils';
import e = require("object.entries");
import e2 = require("object.values");
e.shim();
e2.shim();

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
}

type ScanNode = {
    state:"cached" | "requested";
    isScan: true;
}

type RepositoryKey<T> =  CachedKey<T> | RequestedKey | ScanNode;

export type TweekRepositoryConfig = {
    client:TweekClient;
    keys?:KeyCollection;
}

export type ConfigurationLocation = "local" | "remote";

let getAllPrefixes = (key)=> partitionByIndex(key.split("/"), -1)[0].reduce((acc,next)=>
    ([...acc, [...acc,next].join("/")])
, []);

let getKeyPrefix = (key) => partitionByIndex(key.split("/"), -1)[0].join("/");

let flatMap = (arr, fn)=>  Array.prototype.concat.apply([],arr.map(fn))

export default class TweekRepository{
    private _cache = new Trie<RepositoryKey<any>>(TweekKeySplitJoin);
    private _client:TweekClient;

    constructor({client, keys={}}:TweekRepositoryConfig){
        this._client = client;
        let entries = Object.entries(keys);
        entries.forEach(([key, value])=> this._cache.set(key, {
            state:"cached",
            isScan:false,
            value: value
        }));
        this.setScanNodes("", entries, "cached");
    }

    prepare(key:string){
        let node = this._cache.get(key);
        if (!node) this._cache.set(key, {state:"requested"});
        this.setScanNodes("", getAllPrefixes(key), "requested");
    }

    get(key:string){
        let isScan = key.slice(-1) === "_";
        let node = this._cache.get(key);
        if (isScan && node){
            let prefix = getKeyPrefix(key);
            if (node.state === "requested" && Object.entries(this._cache.listRelative(prefix)).some(([key,value])=> !value.isScan && value.state === "requested")){
                return Promise.reject("value not available yet for key: " + key);
            }
            return Promise.resolve(this._extractScanResult(key));
        }
        if (!node) return Promise.reject(`key ${key} not managed, use prepare to add it to cache`);
        if (node.state === "requested") return Promise.reject("value not available yet");
        if (!node.isScan) return Promise.resolve(node.value);
    }
    
    private _extractScanResult(key){
        let prefix = getKeyPrefix(key);
        return Object.entries(this._cache.listRelative(prefix))
            .filter(([key, valueNode])=> valueNode.state === "cached" && !valueNode.isScan )
            .reduce((acc, [key, valueNode])=>{
                let [fragments, [name]] = partitionByIndex(key.split("/").map(snakeToCamelCase), -1);
                let node = fragments.reduce((node, fragment)=>{
                    if (!acc[fragment]){
                        acc[fragment] = {};
                    }
                    return acc[fragment];
                }, acc);
                node[name] = valueNode.value;
                return acc;
            }, {});
    }

    private setScanNodes(prefix, entries, state){
        distinct(flatMap(entries,([key, _])=> getAllPrefixes(key)))
               .map(path=> [...(prefix ==="" ? [] : [prefix]), path, "_"].join("/") )
               .forEach(key=> this._cache.set(key, {
                    state: state,
                    isScan:true
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

                    let node = this._cache.get(k);
                    if (node){
                        this._cache.set(k, {state: "cached",
                                isScan:false,
                                value
                                });
                    }
                });
                this.setScanNodes(prefix, entries, "cached");
            }
            else{
                this._cache.set(key, {
                    state: "cached",
                    isScan:false,
                    value: config
                });
            }
        });
    }

    refresh(){
        return this._refreshKey("_");
    }
}
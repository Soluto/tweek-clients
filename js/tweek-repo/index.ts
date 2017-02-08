import Trie from './trie';
import TweekClient from '../tweek-rest';
import {partitionByIndex, snakeToCamelCase, distinct} from './utils';
import Optional from "./optional";

require("object.entries").shim();
require("object.values").shim();

export type KeyCollection = {
   [key:string]:any;
}

export const TweekKeySplitJoin = {
    split: (key:string)=> key.split("/"),
    join: (fragments:string[]) => fragments.join("/")
}

type RequestedKey = {
    state:"requested"
    isScan: boolean;
}

type MissingKey = {
    state:"missing"
}

type CachedKey<T> = {
    state:"cached";
    value: T;
    isScan:false;
}

type ScanNode = {
    state:"cached" | "requested";
    isScan: true
}

type RepositoryKey<T> =  CachedKey<T> | RequestedKey | ScanNode | MissingKey;

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
        let isScan = key.slice(-1) === "_";
        if (!node) this._cache.set(key, {state:"requested", isScan});
    }

    get(key:string):Promise<never|Optional<any>|any>{
        let isScan = key.slice(-1) === "_";
        let node = this._cache.get(key);
        if (isScan && node){
            let prefix = getKeyPrefix(key);
            if (node.state === "requested" || Object.entries(this._cache.listRelative(prefix)).some(([key,value])=> value.state === "requested" && !value.isScan)){
                return Promise.reject("value not available yet for key: " + key);
            }
            return Promise.resolve(this._extractScanResult(key));
        }
        if (!node) return Promise.reject(`key ${key} not managed, use prepare to add it to cache`);
        if (node.state === "requested") return Promise.reject("value not available yet");
        if (node.state === "missing") return Promise.resolve(Optional.none());
        if (node.isScan) return Promise.reject('corrupted cache'); 
        return Promise.resolve(Optional.some(node.value));
        
    }
    
    private _extractScanResult(key){
        let prefix = getKeyPrefix(key);
        return Object.entries(this._cache.listRelative(prefix))
            .filter(([key, valueNode])=> valueNode.state === "cached" && !valueNode.isScan )
            .reduce((acc, [key, valueNode]:[string,CachedKey<any>])=>{
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

    private updateNode(key, node, value){
        if (node.state !== "cached" && value === undefined){
            this._cache.set(key, {state:"missing"});
        }
        else if (value !== undefined){
            this._cache.set(key, {
                state: "cached",
                isScan:false,
                value: value
            });
        }
    }

    private _refreshKey(key:string){
        let isScan = key.slice(-1) === "_";
        return this._client.fetch<any>(key, {flatten:true, casing:"snake"} )
        .then(config =>{
            if (isScan){
                let prefix = getKeyPrefix(key);
                let entries = Object.entries(this._cache.list(prefix));
                entries.forEach(([subKey, valueNode])=>{
                    let fullKey = [...(prefix ==="" ? [] : [prefix]), subKey].join("/");
                    this.updateNode(subKey, valueNode, config[subKey]);
                });
                this.setScanNodes(prefix, entries, "cached");
            }
            else{
                this.updateNode(key, this._cache.get(key), config);
            }
        }).catch(()=>this.updateNode(key, this._cache.get(key), undefined));
    }

    refresh(){
        return this._refreshKey("_");
    }
}
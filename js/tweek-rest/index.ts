/// <reference path="./node_modules/@types/isomorphic-fetch/index.d.ts"/>

export type IdentityContext = {id?:string;} & {
    [prop:string]:string;
}

export type Context = {
    [identityType:string]:IdentityContext
}

export type TweekCasing = "snake" | "camelCase";

export type TweekConfig = {
    casing: TweekCasing;
    convertTyping: boolean;
    flatten: boolean;
    context:Context;
}

export type TweekInitConfig = Partial<TweekConfig> & {
    baseServiceUrl:string;
    restGetter: <T>(url)=>Promise<T>;
}

export type TweekFullConfig = TweekConfig & TweekInitConfig;

function captialize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function snakeToCamelCase(target){
    if (typeof(target) !== "object") return target;
       return Object.keys(target).reduce((o, key) => {
         let [firstKey, ...others] = key.split("_");
         let newKey = [firstKey, ...others.map(captialize)].join("");
         o[newKey] = snakeToCamelCase(target[key]);
         return o;
       },{});
    
}

function convertTypingFromJSON(target){
    if (typeof(target) === "string"){
      try {
        return JSON.parse(target);
      } catch (e) {
        return target;
      }
    }
    if (typeof(target) === "object"){
       return Object.keys(target).reduce((o, key) => {
         o[key] = convertTypingFromJSON(target[key]);
         return o;
       },{});
    }
}

function encodeContextUri(identityType:string, context:IdentityContext){
    return [ ...(context.id ? [`${identityType}=${context.id}`] : []) , ...Object.keys(context).filter(x=> x!== "id" && x!== "type")
                                                .map(prop=> `${identityType}.${prop}=${context[prop]}`)].join("&")
}

export default class TweekClient { 
    config:TweekFullConfig;
    
    constructor(config:TweekInitConfig)
    {
        this.config = <TweekFullConfig>{...{camelCase:"snake", flatten:false, convertTyping:false, context:{}}, ...config};
    }
    
    fetch<T>(path:string, _config?: Partial<TweekConfig> ):Promise<T>{
      const {casing, flatten, baseServiceUrl, restGetter, convertTyping, context} = <TweekFullConfig>{...this.config, ..._config};
      let url = `${baseServiceUrl}/${path}?` + Object.keys(context).map(identityType=> encodeContextUri(identityType, context[identityType]) ).join("&");
      if (flatten){
          url += "$flatten=true"
      }
      let result = restGetter<any>(url);

      if (!flatten && casing === "camelCase" ){
          result = result.then(snakeToCamelCase);
      }
      if (convertTyping){
          result = result.then(convertTypingFromJSON);
      }
      return <Promise<T>>result;
    }
}

export function createTweekClient(baseServiceUrl:string, context= {}){
    return new TweekClient({baseServiceUrl, 
        casing:"camelCase", 
        convertTyping:true,
        context,
        restGetter: <T>(url)=>fetch(url).then(x=>x.json<T>())});
}

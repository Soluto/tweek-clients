
interface TweekConfig{
    baseServiceUrl:string;
    casing: "snake" | "camelCase";
    restGetter: <T>(url)=>Promise<T>;
    isTyped: false;
}

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

function convertTyping(target){
    if (typeof(target) === "string"){
      try {
        return JSON.parse(target);
      } catch (e) {
        return target;
      }
    }
    if (typeof(target) === "object"){
       return Object.keys(target).reduce((o, key) => {
         o[key] = convertTyping(target[key]);
         return o;
       },{});
    }
}

export class TweekClient { 
    constructor( private _config:TweekConfig){}
    
    async fetch<T>(path:string):Promise<T>{
      let {casing, baseServiceUrl, restGetter, isTyped} = this._config;
      let result = await restGetter<any>(`${baseServiceUrl}/${path}`);
      if (casing === "camelCase" ){
          result = snakeToCamelCase(result);
      }
      if (isTyped){
          result = convertTyping(result);
      }
      return <T>result;
    }
}
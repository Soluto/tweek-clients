export interface TweekConfig{
    baseServiceUrl:string;
    casing: "snake" | "camelCase";
    restGetter: <T>(url)=>Promise<T>;
    convertTyping: boolean;
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

export default class TweekClient { 
    constructor( private _config:TweekConfig){}
    
    async fetch<T>(path:string, _config= {} ):Promise<T>{
      const {casing, baseServiceUrl, restGetter, convertTyping} = <TweekConfig>{...this._config, ..._config};
      let result = await restGetter<any>(`${baseServiceUrl}/${path}`);
      if (casing === "camelCase" ){
          result = snakeToCamelCase(result);
      }
      if (convertTyping){
          result = convertTypingFromJSON(result);
      }
      return <T>result;
    }
}

export function createTweekClient(baseServiceUrl:string){
    return new TweekClient({baseServiceUrl, 
        casing:"camelCase", 
        convertTyping:true,
        restGetter: <T>(url)=>fetch(url).then(x=>x.json<T>())});
}

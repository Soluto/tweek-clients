
export type IdentityContext = {
    type:string;
    id:string;
    [prop:string]:string;
}

export type TweekConfig = {
    baseServiceUrl:string;
    casing: "snake" | "camelCase";
    restGetter: <T>(url)=>Promise<T>;
    convertTyping: boolean;
    context:IdentityContext[];
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
    constructor( public config:TweekConfig){}
    
    fetch<T>(path:string, _config= {} ):Promise<T>{
      const {casing, baseServiceUrl, restGetter, convertTyping} = <TweekConfig>{...this.config, ..._config};
      let result = restGetter<any>(`${baseServiceUrl}/${path}`);

      if (casing === "camelCase" ){
          result = result.then(snakeToCamelCase);
      }
      if (convertTyping){
          result = result.then(convertTypingFromJSON);
      }
      return <Promise<T>>result;
    }
}

export function createTweekClient(baseServiceUrl:string, ...context:IdentityContext[]){
    return new TweekClient({baseServiceUrl, 
        casing:"camelCase", 
        convertTyping:true,
        context,
        restGetter: <T>(url)=>fetch(url).then(x=>x.json<T>())});
}

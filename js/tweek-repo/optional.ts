type Fallback<T> = ()=>T|never

export default class Optional<T>{
    value:T | null = null;
    hasValue:boolean = false;
    constructor(...args){
       if (args.length ===1){
         this.value = args[0]
         this.hasValue = true;
       }
    }
    
    static some = <T>(value:T)=>new Optional<T>(value);

    static none = <T>() =>new Optional<T>();

    map = <T,U>(fn:(T)=>U) => this.flatMap((v)=>Optional.some(fn(v)));

    flatMap = <T,U>(fn:(T)=>Optional<U>) =>this.hasValue ? fn(this.value) : Optional.none<U>();

    orElse = (value:T | Fallback<T> | null) => {
        if (typeof(value) === "function"){
          return value();
        } else{
          return value;
        }
    }
    orNull = ()=> this.orElse(null);
}
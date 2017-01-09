import 'mocha';
import {expect} from 'chai';
import fetchMock  from 'fetch-mock';
import TweekClient from '../';

describe("tweek client", ()=>{
    let mockRest = <T>()=><Promise<T>>Promise.resolve(null);
    let identity = {
        id:"userid",
        type:"user",
        gender:"male"
    };
    
    let client = new TweekClient({baseServiceUrl: "test", casing: "snake", convertTyping: false, context: [],restGetter:mockRest })

    it("", ()=>{
        
    });
})
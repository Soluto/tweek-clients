import 'mocha';
import {expect} from 'chai';
import TweekRepository from '../';
import {MemoryStore} from '../';
import TweekClient from '../../tweek-rest';
import {createTweekClient} from '../../tweek-rest';
import Optional from '../optional'

import {fakeServer as TweekServer, httpFakeCalls as http} from 'simple-fake-server';
import axios from 'axios';

const scheduler = (fn:()=>void)=>fn();

describe("tweek repo test", () => {
    let client;

    beforeEach(() =>  {
        TweekServer.start(1234);
        
        http.get().to("/configurations/_\\?\\$flatten=true").willReturn({
            "my_path/string_value": "my-string",            
            "my_path/inner_path_1/int_value": "55",
            "my_path/inner_path_1/bool_positive_value": "true",     
            "my_path/inner_path_2/bool_negative_value": "false",

            "some_path/inner_path_1/first_value": "value_1",            
            "some_path/inner_path_1/second_value": "value_2",
            "deeply_nested/a/b/c/d/value": "value_5",
            "some_other_path/inner_path_2/third_value": "value_3"                
        })
        client = createTweekClient("http://localhost:1234/configurations", {}, 
            url => <any>axios.get(url).then(r => r.data));  
    });

    afterEach(() => {
        TweekServer.stop(1234);      
    });

    describe("retrieve", () => {
        it("should get single key", async () => {
            let store = new MemoryStore();        
            let tweekRepo = new TweekRepository({client, store});
            await tweekRepo.init();
            await tweekRepo.prepare("my_path/string_value");
            await tweekRepo.prepare("my_path/inner_path_1/int_value");
            await tweekRepo.prepare("my_path/inner_path_1/bool_positive_value");
            await tweekRepo.prepare("my_path/inner_path_2/bool_negative_value");       
            
            await tweekRepo.refresh();
            let key1 = await tweekRepo.get("my_path/string_value");
            let key2 = await tweekRepo.get("my_path/inner_path_1/int_value");
            let key3 = await tweekRepo.get("my_path/inner_path_1/bool_positive_value");
            let key4 = await tweekRepo.get("my_path/inner_path_2/bool_negative_value");
                            
            expect(key1.value).to.eq("my-string");
            expect(key2.value).to.eq(55);
            expect(key3.value).to.eq(true);
            expect(key4.value).to.eq(false);
        });

        it("should get scan result", async () => {
            let store = new MemoryStore();        
            let tweekRepo = new TweekRepository({client, store});
            await tweekRepo.init();
            await tweekRepo.prepare("some_path/_")
            await tweekRepo.refresh();
            
            let config = await tweekRepo.get("some_path/_");
            expect(config.innerPath1.firstValue).to.eq("value_1");
            expect(config.innerPath1.secondValue).to.eq("value_2");        
        }); 

        it("should get scan result deeply nested", async () => {
            let store = new MemoryStore();        
            let tweekRepo = new TweekRepository({client, store});
            await tweekRepo.init();
            await tweekRepo.prepare("deeply_nested/_")
            await tweekRepo.refresh();
            
            let config = await tweekRepo.get("deeply_nested/a/b/c/_");
            expect(config.d.value).to.eq("value_5");        
        });    

        it("should get root scan", async () => {
            let store = new MemoryStore();        
            let tweekRepo = new TweekRepository({client, store});
            await tweekRepo.init();
            await tweekRepo.prepare("_")
            await tweekRepo.refresh();
            
            let config = await tweekRepo.get("_");
            expect(config.innerPath1.firstValue).to.eq("value_1");
        });

        it("should get single key after scan prepare", async ()=>{
            let store = new MemoryStore();                
            let tweekRepo = new TweekRepository({client, store});
            await tweekRepo.init();
            tweekRepo.prepare("some_path/_");

            await tweekRepo.refresh();

            let key = await tweekRepo.get("some_path/inner_path_1/first_value");
            expect(key.value).to.eql("value_1");
        });                    
    })

    describe("persistence", () => {
        
        it("should persist to store after refresh", async () => {
            let store = new MemoryStore();        
            let tweekRepo = new TweekRepository({client, store});
            await tweekRepo.init();
            await tweekRepo.prepare("some_path/inner_path_1/_")
            
            await tweekRepo.refresh();

            const persistedResult = await store.load();
            expect(persistedResult['some_path/inner_path_1/_'].isScan).to.eq(true)            
            expect(persistedResult['some_path/inner_path_1/first_value'].value).to.eq("value_1")
            expect(persistedResult['some_path/inner_path_1/second_value'].value).to.eq("value_2")            
        });

        it("should load persisted key", async () => {
            const persistedNodes = {
                'some_path/inner_path_1/first_value': { state: 'cached', value: 'value_1', isScan: false }
            }        
            let store = new MemoryStore(persistedNodes);        
            let tweekRepo = new TweekRepository({client, store});
            await tweekRepo.init();

            let key = await tweekRepo.get("some_path/inner_path_1/first_value");
            expect(key.value).to.eq("value_1");
        });

        it("should load persisted scan", async () => {
            const persistedNodes = {
                'some_path/_': { state: 'cached', isScan: true },                
                'some_path/inner_path_1/_': { state: 'cached', isScan: true },
                'some_path/inner_path_1/first_value': { state: 'cached', value: 'value_1', isScan: false },
                'some_path/inner_path_1/second_value': { state: 'cached', value: 'value_2', isScan: false } 
            }
            const store = new MemoryStore(persistedNodes);
            const tweekRepo = new TweekRepository({client, store});
            await tweekRepo.init();
                    
            const result1 = await tweekRepo.get("some_path/inner_path_1/_")
            expect(result1).to.eql({firstValue: "value_1", secondValue: "value_2"});
            
            const result2 = await tweekRepo.get("some_path/_")
            expect(result2).to.eql({innerPath1: {firstValue:"value_1", secondValue:"value_2"}});
        });

        it("should load single key from persistence and update key after refresh", async () => {
            const persistedNodes = {
                'some_path/inner_path_1/first_value': { state: 'cached', value: 'old_value', isScan: false }
            }
            let store = new MemoryStore(persistedNodes);
            let tweekRepo = new TweekRepository({client, store});
            await tweekRepo.init();

            let old = await tweekRepo.get("some_path/inner_path_1/first_value")
            expect(old.value).to.eql("old_value");

            await tweekRepo.refresh();

            let _new = await tweekRepo.get("some_path/inner_path_1/first_value")        
            expect(_new.value).to.eql("value_1");
        });
    })    
    
    describe("error flows", () => {

        it("should get key which was never requested or init", async () => {
            let store = new MemoryStore();                            
            let tweekRepo = new TweekRepository({client, store});
            await tweekRepo.init();
            await tweekRepo.refresh();

            try {
                await tweekRepo.get("path/that/was/not_prepared");                
            }
            catch (e) {
                expect(e).to.eql("key path/that/was/not_prepared not managed, use prepare to add it to cache");
            }
        });
    });
})
import 'mocha';
import {expect} from 'chai';
import TweekRepository from '../';
import TweekClient from '../../tweek-rest';

const scheduler = (fn:()=>void)=>fn();

describe("tweek repo test", ()=>{
    let tweekClient = new TweekClient({baseServiceUrl:"", restGetter:(url)=>{
        if (url.match(/\_($|\?)/)){
            return Promise.resolve({
                "some_path/inner/my":"1",
                "some_path/inner/other_key":"2",
                "some/inner_path/my_key": "3"
            });
        }
        return Promise.resolve("");
    }})

    it("get key from init", async ()=>{
        let tweekRepo = new TweekRepository({client:tweekClient, keys:{"some/inner_path/my_key":"0"}});
        let val = await tweekRepo.get("some/inner_path/my_key");
        expect(val).to.eq("0");
    });

    it("get key from init using scan", async ()=>{
        let tweekRepo = new TweekRepository({client:tweekClient, keys:{"some/inner_path/my":"0", "some/inner_path/other_key":"1" }});
        let val = await tweekRepo.get("some/inner_path/_")
        expect(val).to.eql({my:"0", otherKey:"1"});
        val = await tweekRepo.get("some/_")
        expect(val).to.eql({innerPath:{my:"0", otherKey:"1"}});
    });

    it("get key from init and request refresh should get updated value", async ()=>{
        let tweekRepo = new TweekRepository({client:tweekClient, keys:{"some/inner_path/my_key":"0"}});
        await tweekRepo.refresh();
        let val = await tweekRepo.get("some/inner_path/my_key")
        expect(val).to.eql("3");
        val = await tweekRepo.get("some/_")
        expect(val).to.eql({innerPath:{myKey:"3"}});
    });

    it("prepare key and refresh should get server value", async ()=>{
        let tweekRepo = new TweekRepository({client:tweekClient, keys:{"some/inner_path/other_key":"1"}});
        tweekRepo.prepare("some/inner_path/my_key");
        await tweekRepo.refresh();
        let val = await tweekRepo.get("some/inner_path/my_key");
        expect(val).to.eql("3");
        val = await tweekRepo.get("some/_")
        expect(val).to.eql({innerPath:{myKey:"3", otherKey:"1"}});
    });

    
    it("prepare key and get scan", async ()=>{
        let tweekRepo = new TweekRepository({client:tweekClient, keys:{}});
        tweekRepo.prepare("some/inner_path/my_key");
        await tweekRepo.refresh();
        let val = await tweekRepo.get("some/inner_path/my_key");
        expect(val).to.eql("3");
        tweekRepo.prepare("some/a");
        val = await tweekRepo.get("some/_")
        expect(val).to.eql({innerPath:{myKey:"3"}});

    });
    /*
    describe("error flows", ()=>{
        it("get key which was never requested or init", async ()=>{
            let tweekRepo = new TweekRepository({client:tweekClient, keys:{"some/inner_path/my_key":"0"}});
            await tweekRepo.refresh();
            let val = await tweekRepo.get("some/inner_path/my_key")
            expect(val).to.eql("3");
            val = await tweekRepo.get("some/_")
            expect(val).to.eql({innerPath:{myKey:"3"}});
            });
        });
        })
    */
})
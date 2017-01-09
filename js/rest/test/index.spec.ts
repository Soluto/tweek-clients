/// <reference path="../node_modules/@types/es6-shim/index.d.ts"/>

import 'mocha';
import sinon = require('sinon');
import chai = require('chai');
import sinonChai = require('sinon-chai');
chai.use(sinonChai);
let {expect} = chai;

import TweekClient from '../index';

describe("tweek client", ()=>{
    
    let identity = {
        id:"userid",
        type:"user",
        gender:"male"
    };
    
    let prepare = ()=> {
        let stub= sinon.stub();
        return {client:new TweekClient({baseServiceUrl: "test", casing: "snake", convertTyping: false,restGetter:stub }), stub};
    };

    it("request configuration url path is correct", async ()=>{
        const {client, stub} = prepare();
        await client.fetch("abc");
        expect(stub).to.have.been.calledOnce;
        expect(stub).to.have.been.calledWithMatch(sinon.match(/test\/abc/));        
    });

    it("request configuration url contains the right context", async ()=>{
        const {client, stub} = prepare();
        await client.fetch("_", {context:[identity]});
        expect(stub).to.have.been.calledOnce;
        expect(stub).to.have.been.calledWithMatch(sinon.match(/\?.*user=userid/));
        expect(stub).to.have.been.calledWithMatch(sinon.match(/\?.*user.gender=male/));
    });

    it("request configuration with different casing", async ()=>{
        const {client, stub} = prepare();
        stub.returns(Promise.resolve({some_path: {some_key: "abc"} }));
        let result = await client.fetch("_", {casing:"camelCase"});
        expect(result).to.eql({somePath:{someKey:"abc"}}, "camelCasing conversion is incorrect");
        result = await client.fetch("_", {casing:"snake"});
        expect(result).to.eql({some_path:{some_key:"abc"}}, "snake casing conversion is incorrect");
    });

    it("request configuration with different type conversion", async ()=>{
        const {client, stub} = prepare();
        stub.returns(Promise.resolve({some_path: {some_key: "true"} }));
        let result = await client.fetch("_", {convertTyping:true});
        expect(result).to.eql({some_path:{some_key:true}});
    });
})
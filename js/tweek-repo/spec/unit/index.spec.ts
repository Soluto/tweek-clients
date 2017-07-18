import 'mocha';
import chai = require('chai');
import TweekRepository from '../../';
import { MemoryStore, ITweekStore } from '../../';
import { } from '../';
import { FetchConfig, createTweekClient, TweekClient, ITweekClient } from '../../../tweek-rest';
import Optional from '../../optional'
import { fakeServer as TweekServer, httpFakeCalls as http } from 'simple-fake-server';
import axios from 'axios';
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import chaiAsPromise = require('chai-as-promised');
chai.use(sinonChai);
chai.use(chaiAsPromise);
const { expect, assert } = chai;

const scheduler = (fn: () => void) => fn();

describe("tweek repo test", () => {
    let _defaultClient: ITweekClient;
    let _createClientThatFails: () => ITweekClient;    
    let _tweekRepo;

    async function initRepository(customStore?: ITweekStore, customClient?: ITweekClient) {
        _tweekRepo = new TweekRepository({ client: customClient || _defaultClient });
        if (customStore) {
            await _tweekRepo.useStore(customStore);            
        }
    };

    beforeEach(() => {
        TweekServer.start(1234);

        http.get().to("/api/v1/keys/_/*").willReturn({
            "my_path/string_value": "my-string",
            "my_path/inner_path_1/int_value": 55,
            "my_path/inner_path_1/bool_positive_value": true,
            "my_path/inner_path_2/bool_negative_value": false,
            "some_path/inner_path_1/first_value": "value_1",
            "some_path/inner_path_1/second_value": "value_2",
            "deeply_nested/a/b/c/d/value": "value_5",
            "some_other_path/inner_path_2/third_value": "value_3"
        });

        _createClientThatFails = () => {
            http.get().to("/api/v1/keys/_/*").willFail(500);
            return createTweekClient("http://localhost:1234/api/v1/keys/_", {},
                (url: string) => <any>axios.get(url).then(r => r.data));        
        }

        _defaultClient = createTweekClient("http://localhost:1234/api/v1/keys/_", {},
            (url: string) => <any>axios.get(url).then(r => r.data));
    });

    afterEach(() => {
        TweekServer.stop(1234);
    });

    describe("retrieve", () => {
        it("should get single key", async () => {
            // Arrange
            await initRepository();

            await _tweekRepo.prepare("my_path/string_value");
            await _tweekRepo.prepare("my_path/inner_path_1/int_value");
            await _tweekRepo.prepare("my_path/inner_path_1/bool_positive_value");
            await _tweekRepo.prepare("my_path/inner_path_2/bool_negative_value");

            await _tweekRepo.refresh();

            // Act
            let key1 = await _tweekRepo.get("my_path/string_value");
            let key2 = await _tweekRepo.get("my_path/inner_path_1/int_value");
            let key3 = await _tweekRepo.get("my_path/inner_path_1/bool_positive_value");
            let key4 = await _tweekRepo.get("my_path/inner_path_2/bool_negative_value");

            // Assert
            expect(key1.value).to.eq("my-string");
            expect(key2.value).to.eq(55);
            expect(key3.value).to.eq(true);
            expect(key4.value).to.eq(false);
        });

        it("should get keys node", async () => {
            // Arrange
            await initRepository();

            await _tweekRepo.prepare("some_path/_");
            await _tweekRepo.refresh();

            const expectedKeysNode = {
                innerPath1: {
                    firstValue: 'value_1',
                    secondValue: 'value_2'
                }
            };

            // Act
            let keysNode = await _tweekRepo.get("some_path/_");

            // Assert
            expect(keysNode).to.deep.eq(expectedKeysNode);
        });

        it("should get scan result", async () => {
            // Arrange
            await initRepository();
            await _tweekRepo.prepare("some_path/_")
            await _tweekRepo.refresh();

            // Act
            let config = await _tweekRepo.get("some_path/_");

            // Assert
            expect(config.innerPath1.firstValue).to.eq("value_1");
            expect(config.innerPath1.secondValue).to.eq("value_2");
        });

        it("should get scan result deeply nested", async () => {
            // Arrange
            await initRepository();
            await _tweekRepo.prepare("deeply_nested/_")
            await _tweekRepo.refresh();

            // Act
            let config = await _tweekRepo.get("deeply_nested/a/b/_");

            // Assert
            expect(config.c.d.value).to.eq("value_5");
        });

        it("should get root scan", async () => {
            // Arrange
            await initRepository();
            await _tweekRepo.prepare("_")
            await _tweekRepo.refresh();

            // Act
            let config = await _tweekRepo.get("_");

            // Assert
            expect(config.innerPath1.firstValue).to.eq("value_1");
        });

        it("should get single key after scan prepare", async () => {
            // Arrange
            await initRepository();
            _tweekRepo.prepare("some_path/_");

            await _tweekRepo.refresh();

            // Act
            let key = await _tweekRepo.get("some_path/inner_path_1/first_value");

            // Assert
            expect(key.value).to.eql("value_1");
        });
    });

    describe("persistence", () => {
        it("should persist to store after refresh", async () => {
            // Arrange
            const store = new MemoryStore();
            await initRepository(store);
            await _tweekRepo.prepare("some_path/inner_path_1/_")

            // Act
            await _tweekRepo.refresh();

            // Assert
            const persistedResult = await store.load();            
            expect(persistedResult['some_path/inner_path_1/_'].isScan).to.eq(true)
            expect(persistedResult['some_path/inner_path_1/first_value'].value).to.eq("value_1")
            expect(persistedResult['some_path/inner_path_1/second_value'].value).to.eq("value_2")
        });
       
        it("should load persisted key", async () => {
            // Arrange
            const persistedNodes = {
                'some_path/inner_path_1/first_value': { state: 'cached', value: 'value_1', isScan: false }
            };
            const store = new MemoryStore(persistedNodes);
            await initRepository(store);

            // Act
            let key = await _tweekRepo.get("some_path/inner_path_1/first_value");

            // Assert
            expect(key.value).to.eq("value_1");
        });

        it("should load persisted scan", async () => {
            // Arrange
            const persistedNodes = {
                'some_path/_': { state: 'cached', isScan: true },
                'some_path/inner_path_1/_': { state: 'cached', isScan: true },
                'some_path/inner_path_1/first_value': { state: 'cached', value: 'value_1', isScan: false },
                'some_path/inner_path_1/second_value': { state: 'cached', value: 'value_2', isScan: false }
            };
            const store = new MemoryStore(persistedNodes);
            await initRepository(store);

            // Act & Assert
            const result1 = await _tweekRepo.get("some_path/inner_path_1/_")
            expect(result1).to.eql({ firstValue: "value_1", secondValue: "value_2" });

            const result2 = await _tweekRepo.get("some_path/_")
            expect(result2).to.eql({ innerPath1: { firstValue: "value_1", secondValue: "value_2" } });
        });

        it("should load single key from persistence and update key after refresh", async () => {
            // Arrange
            const persistedNodes = {
                'some_path/inner_path_1/first_value': { state: 'cached', value: 'old_value', isScan: false }
            };

            const store = new MemoryStore(persistedNodes);
            await initRepository(store);

            // Act & assert
            let old = await _tweekRepo.get("some_path/inner_path_1/first_value")
            expect(old.value).to.eql("old_value");

            await _tweekRepo.refresh();

            let _new = await _tweekRepo.get("some_path/inner_path_1/first_value")
            expect(_new.value).to.eql("value_1");
        });
    });

    describe("add flat keys", () => {
        it("should add flat key and update it after refresh", async () => {
            const tweekRepo = new TweekRepository({ client: _defaultClient });
            const keys = {
                "some_path/inner_path_1/first_value": "default_value"
            }
            tweekRepo.addKeys(keys);

            const result1 = await tweekRepo.get("some_path/inner_path_1/first_value");
            expect(result1.value).to.eql("default_value");            

            await tweekRepo.refresh();
            const result2 = await tweekRepo.get("some_path/inner_path_1/first_value");  
            expect(result2.value).to.eql("value_1");                              
        });
    })

    describe("error flows", () => {
        it("should throw error when requesting key that was not prepared or cached", async () => {
            // Arrange
            await initRepository();
            await _tweekRepo.refresh();

            try {
                await _tweekRepo.get("path/that/was/not_prepared");
            }
            catch (e) {
                expect(e).to.eql("key path/that/was/not_prepared not managed, use prepare to add it to cache");
            }
        });
    });

    describe("refresh", () => {
        it('should not do fetch request if there are no requested keys', async () => {
            // Arrange
            let store = new MemoryStore();

            const fetchStub = sinon.stub();
            const clientMock: ITweekClient = {
                fetch: <any>fetchStub
            };

            _tweekRepo = new TweekRepository({client: clientMock});
            await _tweekRepo.useStore(store);

            // Act
            const refreshPromise = _tweekRepo.refresh();
            await refreshPromise;

            // Assert
            expect(fetchStub).to.have.not.been.called;
            expect(refreshPromise).to.eventually.equal(null, 'should not return any keys');
        });

        //TODO: make this test more clear, it should not throw error from fetch in order the execute the scenario
        it("should call client fetch with all current keys", async () => {
            // Arrange
            let store = new MemoryStore();

            const fetchStub = sinon.stub();
            fetchStub.onCall(0).returns(Promise.reject(''));
            const clientMock: ITweekClient = {
                fetch: <any>fetchStub
            };

            _tweekRepo = new TweekRepository({ client: clientMock });
            await _tweekRepo.useStore(store);
            const expectedContext = { 'prop': 'value' };
            _tweekRepo.context = expectedContext;

            const expectedKeys = ["some_path1/_", "some_path2/key1", "some_path3/key2"];
            await _tweekRepo.prepare("some_path1/_");
            await _tweekRepo.prepare("some_path2/key1");
            await _tweekRepo.prepare("some_path3/key2");

            const expectedFetchConfig: FetchConfig = {
                flatten: true,
                casing: "snake",
                context: <any>expectedContext,
                include: expectedKeys,
            };

            // Act
            await _tweekRepo.refresh().catch(_ => {});

            // Assert
            expect(fetchStub).to.have.been.calledOnce;

            const fetchParameters = fetchStub.args[0];
            const [fetchUrl, fetchConfig] = fetchParameters;
            expect(fetchUrl).to.eql('_');
            expect(fetchConfig).to.eql(expectedFetchConfig)
        });

        it("should throw error when fetch fails", async () => {
            // Arrange
            _tweekRepo = new TweekRepository({ client: _createClientThatFails() });
            await _tweekRepo.prepare("some_path/key");

            // Act
            try {
                await _tweekRepo.refresh();
            }
            catch (e) {
                // Assert                
                expect(e.message).to.equal("Request failed with status code 500")
                return;
            }
            expect.fail();
        });
    });
})
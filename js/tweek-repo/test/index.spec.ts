import 'mocha';
import chai = require('chai');
import TweekRepository from '../';
import { MemoryStore } from '../';
import { } from '../';
import { FetchConfig, createTweekClient, TweekClient, ITweekClient } from '../../tweek-rest';
import Optional from '../optional'
import { fakeServer as TweekServer, httpFakeCalls as http } from 'simple-fake-server';
import axios from 'axios';
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
chai.use(sinonChai);
const expect = chai.expect;

const scheduler = (fn: () => void) => fn();

describe("tweek repo test", () => {
    let _client: ITweekClient;
    let _tweekRepo;

    async function initRepository(initializeStoreKeys?: Object) {
        let store = new MemoryStore(initializeStoreKeys);
        _tweekRepo = new TweekRepository({ client: _client, store });
        await _tweekRepo.init();
        return store;
    };

    beforeEach(() => {
        TweekServer.start(1234);

        http.get().to("/configurations/_/*").willReturn({
            "my_path/string_value": "my-string",
            "my_path/inner_path_1/int_value": "55",
            "my_path/inner_path_1/bool_positive_value": "true",
            "my_path/inner_path_2/bool_negative_value": "false",

            "some_path/inner_path_1/first_value": "value_1",
            "some_path/inner_path_1/second_value": "value_2",
            "deeply_nested/a/b/c/d/value": "value_5",
            "some_other_path/inner_path_2/third_value": "value_3"
        });

        _client = createTweekClient("http://localhost:1234/configurations/_", {},
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
            let config = await _tweekRepo.get("deeply_nested/a/b/c/_");

            // Assert
            expect(config.d.value).to.eq("value_5");
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
            const store = await initRepository();
            await _tweekRepo.prepare("some_path/inner_path_1/_")

            // Act
            await _tweekRepo.refresh();
            const persistedResult = await store.load();

            // Assert
            expect(persistedResult['some_path/inner_path_1/_'].isScan).to.eq(true)
            expect(persistedResult['some_path/inner_path_1/first_value'].value).to.eq("value_1")
            expect(persistedResult['some_path/inner_path_1/second_value'].value).to.eq("value_2")
        });

        it("should load persisted key", async () => {
            // Arrange
            const persistedNodes = {
                'some_path/inner_path_1/first_value': { state: 'cached', value: 'value_1', isScan: false }
            };

            await initRepository(persistedNodes);

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

            await initRepository(persistedNodes);

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

            await initRepository(persistedNodes);

            // Act & assert
            let old = await _tweekRepo.get("some_path/inner_path_1/first_value")
            expect(old.value).to.eql("old_value");

            await _tweekRepo.refresh();

            let _new = await _tweekRepo.get("some_path/inner_path_1/first_value")
            expect(_new.value).to.eql("value_1");
        });
    });

    describe("error flows", () => {
        it("should get key which was never requested or init", async () => {
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
        it("should call client fetch with all current keys", async () => {
            // Arrange
            let store = new MemoryStore();

            const fetchStub = sinon.stub();
            fetchStub.onCall(0).returns(Promise.resolve(undefined));
            const clientMock: ITweekClient = {
                fetch: <any>fetchStub
            };

            _tweekRepo = new TweekRepository({ client: clientMock, store });
            await _tweekRepo.init();
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
            await _tweekRepo.refresh();

            // Assert
            expect(fetchStub).to.have.been.calledOnce;

            const fetchParameters = fetchStub.args[0];
            const [fetchUrl, fetchConfig] = fetchParameters;
            expect(fetchUrl).to.eql('_');
            expect(fetchConfig).to.eql(expectedFetchConfig)
        });
    });
})
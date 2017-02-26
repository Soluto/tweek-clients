"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
require("mocha");
var chai = require("chai");
var _1 = require("../../");
var _2 = require("../../");
var tweek_rest_1 = require("../../../tweek-rest");
var simple_fake_server_1 = require("simple-fake-server");
var axios_1 = require("axios");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var chaiAsPromise = require("chai-as-promised");
chai.use(sinonChai);
chai.use(chaiAsPromise);
var expect = chai.expect, assert = chai.assert;
var scheduler = function (fn) { return fn(); };
describe("tweek repo test", function () {
    var _client;
    var _tweekRepo;
    function initRepository(initializeStoreKeys) {
        return __awaiter(this, void 0, void 0, function () {
            var store;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new _2.MemoryStore(initializeStoreKeys);
                        _tweekRepo = new _1.default({ client: _client, store: store });
                        return [4 /*yield*/, _tweekRepo.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, store];
                }
            });
        });
    }
    ;
    beforeEach(function () {
        simple_fake_server_1.fakeServer.start(1234);
        simple_fake_server_1.httpFakeCalls.get().to("/configurations/_/*").willReturn({
            "my_path/string_value": "my-string",
            "my_path/inner_path_1/int_value": "55",
            "my_path/inner_path_1/bool_positive_value": "true",
            "my_path/inner_path_2/bool_negative_value": "false",
            "some_path/inner_path_1/first_value": "value_1",
            "some_path/inner_path_1/second_value": "value_2",
            "deeply_nested/a/b/c/d/value": "value_5",
            "some_other_path/inner_path_2/third_value": "value_3"
        });
        _client = tweek_rest_1.createTweekClient("http://localhost:1234/configurations/_", {}, function (url) { return axios_1.default.get(url).then(function (r) { return r.data; }); });
    });
    afterEach(function () {
        simple_fake_server_1.fakeServer.stop(1234);
    });
    describe("retrieve", function () {
        it("should get single key", function () { return __awaiter(_this, void 0, void 0, function () {
            var key1, key2, key3, key4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Arrange
                    return [4 /*yield*/, initRepository()];
                    case 1:
                        // Arrange
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.prepare("my_path/string_value")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.prepare("my_path/inner_path_1/int_value")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.prepare("my_path/inner_path_1/bool_positive_value")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.prepare("my_path/inner_path_2/bool_negative_value")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.refresh()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("my_path/string_value")];
                    case 7:
                        key1 = _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("my_path/inner_path_1/int_value")];
                    case 8:
                        key2 = _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("my_path/inner_path_1/bool_positive_value")];
                    case 9:
                        key3 = _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("my_path/inner_path_2/bool_negative_value")];
                    case 10:
                        key4 = _a.sent();
                        // Assert
                        expect(key1.value).to.eq("my-string");
                        expect(key2.value).to.eq(55);
                        expect(key3.value).to.eq(true);
                        expect(key4.value).to.eq(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should get scan result", function () { return __awaiter(_this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Arrange
                    return [4 /*yield*/, initRepository()];
                    case 1:
                        // Arrange
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.prepare("some_path/_")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.refresh()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("some_path/_")];
                    case 4:
                        config = _a.sent();
                        // Assert
                        expect(config.innerPath1.firstValue).to.eq("value_1");
                        expect(config.innerPath1.secondValue).to.eq("value_2");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should get scan result deeply nested", function () { return __awaiter(_this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Arrange
                    return [4 /*yield*/, initRepository()];
                    case 1:
                        // Arrange
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.prepare("deeply_nested/_")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.refresh()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("deeply_nested/a/b/c/_")];
                    case 4:
                        config = _a.sent();
                        // Assert
                        expect(config.d.value).to.eq("value_5");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should get root scan", function () { return __awaiter(_this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Arrange
                    return [4 /*yield*/, initRepository()];
                    case 1:
                        // Arrange
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.prepare("_")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.refresh()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("_")];
                    case 4:
                        config = _a.sent();
                        // Assert
                        expect(config.innerPath1.firstValue).to.eq("value_1");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should get single key after scan prepare", function () { return __awaiter(_this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Arrange
                    return [4 /*yield*/, initRepository()];
                    case 1:
                        // Arrange
                        _a.sent();
                        _tweekRepo.prepare("some_path/_");
                        return [4 /*yield*/, _tweekRepo.refresh()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("some_path/inner_path_1/first_value")];
                    case 3:
                        key = _a.sent();
                        // Assert
                        expect(key.value).to.eql("value_1");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("persistence", function () {
        it("should persist to store after refresh", function () { return __awaiter(_this, void 0, void 0, function () {
            var store, persistedResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, initRepository()];
                    case 1:
                        store = _a.sent();
                        return [4 /*yield*/, _tweekRepo.prepare("some_path/inner_path_1/_")];
                    case 2:
                        _a.sent();
                        // Act
                        return [4 /*yield*/, _tweekRepo.refresh()];
                    case 3:
                        // Act
                        _a.sent();
                        return [4 /*yield*/, store.load()];
                    case 4:
                        persistedResult = _a.sent();
                        // Assert
                        expect(persistedResult['some_path/inner_path_1/_'].isScan).to.eq(true);
                        expect(persistedResult['some_path/inner_path_1/first_value'].value).to.eq("value_1");
                        expect(persistedResult['some_path/inner_path_1/second_value'].value).to.eq("value_2");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should load persisted key", function () { return __awaiter(_this, void 0, void 0, function () {
            var persistedNodes, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        persistedNodes = {
                            'some_path/inner_path_1/first_value': { state: 'cached', value: 'value_1', isScan: false }
                        };
                        return [4 /*yield*/, initRepository(persistedNodes)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("some_path/inner_path_1/first_value")];
                    case 2:
                        key = _a.sent();
                        // Assert
                        expect(key.value).to.eq("value_1");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should load persisted scan", function () { return __awaiter(_this, void 0, void 0, function () {
            var persistedNodes, result1, result2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        persistedNodes = {
                            'some_path/_': { state: 'cached', isScan: true },
                            'some_path/inner_path_1/_': { state: 'cached', isScan: true },
                            'some_path/inner_path_1/first_value': { state: 'cached', value: 'value_1', isScan: false },
                            'some_path/inner_path_1/second_value': { state: 'cached', value: 'value_2', isScan: false }
                        };
                        return [4 /*yield*/, initRepository(persistedNodes)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("some_path/inner_path_1/_")];
                    case 2:
                        result1 = _a.sent();
                        expect(result1).to.eql({ firstValue: "value_1", secondValue: "value_2" });
                        return [4 /*yield*/, _tweekRepo.get("some_path/_")];
                    case 3:
                        result2 = _a.sent();
                        expect(result2).to.eql({ innerPath1: { firstValue: "value_1", secondValue: "value_2" } });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should load single key from persistence and update key after refresh", function () { return __awaiter(_this, void 0, void 0, function () {
            var persistedNodes, old, _new;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        persistedNodes = {
                            'some_path/inner_path_1/first_value': { state: 'cached', value: 'old_value', isScan: false }
                        };
                        return [4 /*yield*/, initRepository(persistedNodes)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("some_path/inner_path_1/first_value")];
                    case 2:
                        old = _a.sent();
                        expect(old.value).to.eql("old_value");
                        return [4 /*yield*/, _tweekRepo.refresh()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.get("some_path/inner_path_1/first_value")];
                    case 4:
                        _new = _a.sent();
                        expect(_new.value).to.eql("value_1");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("error flows", function () {
        it("should get key which was never requested or init", function () { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Arrange
                    return [4 /*yield*/, initRepository()];
                    case 1:
                        // Arrange
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.refresh()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, _tweekRepo.get("path/that/was/not_prepared")];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        expect(e_1).to.eql("key path/that/was/not_prepared not managed, use prepare to add it to cache");
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
    });
    describe("refresh", function () {
        it('should not do fetch request if there are no requested keys', function () { return __awaiter(_this, void 0, void 0, function () {
            var store, fetchStub, clientMock, refreshPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new _2.MemoryStore();
                        fetchStub = sinon.stub();
                        clientMock = {
                            fetch: fetchStub
                        };
                        _tweekRepo = new _1.default({ client: clientMock, store: store });
                        return [4 /*yield*/, _tweekRepo.init()];
                    case 1:
                        _a.sent();
                        refreshPromise = _tweekRepo.refresh();
                        return [4 /*yield*/, refreshPromise];
                    case 2:
                        _a.sent();
                        // Assert
                        expect(fetchStub).to.have.not.been.called;
                        expect(refreshPromise).to.eventually.equal(null, 'should not return any keys');
                        return [2 /*return*/];
                }
            });
        }); });
        it("should call client fetch with all current keys", function () { return __awaiter(_this, void 0, void 0, function () {
            var store, fetchStub, clientMock, expectedContext, expectedKeys, expectedFetchConfig, fetchParameters, fetchUrl, fetchConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = new _2.MemoryStore();
                        fetchStub = sinon.stub();
                        fetchStub.onCall(0).returns(Promise.reject(''));
                        clientMock = {
                            fetch: fetchStub
                        };
                        _tweekRepo = new _1.default({ client: clientMock, store: store });
                        return [4 /*yield*/, _tweekRepo.init()];
                    case 1:
                        _a.sent();
                        expectedContext = { 'prop': 'value' };
                        _tweekRepo.context = expectedContext;
                        expectedKeys = ["some_path1/_", "some_path2/key1", "some_path3/key2"];
                        return [4 /*yield*/, _tweekRepo.prepare("some_path1/_")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.prepare("some_path2/key1")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, _tweekRepo.prepare("some_path3/key2")];
                    case 4:
                        _a.sent();
                        expectedFetchConfig = {
                            flatten: true,
                            casing: "snake",
                            context: expectedContext,
                            include: expectedKeys,
                        };
                        // Act
                        return [4 /*yield*/, _tweekRepo.refresh()];
                    case 5:
                        // Act
                        _a.sent();
                        // Assert
                        expect(fetchStub).to.have.been.calledOnce;
                        fetchParameters = fetchStub.args[0];
                        fetchUrl = fetchParameters[0], fetchConfig = fetchParameters[1];
                        expect(fetchUrl).to.eql('_');
                        expect(fetchConfig).to.eql(expectedFetchConfig);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=index.spec.js.map
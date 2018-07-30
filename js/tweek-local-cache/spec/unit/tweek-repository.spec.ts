import 'mocha';
import chai = require('chai');
import { FetchConfig, createTweekClient, ITweekClient, Context } from 'tweek-client';
import { fakeServer as TweekServer, httpFakeCalls as http } from 'simple-fake-server';
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import chaiAsPromise = require('chai-as-promised');
import MemoryStore from '../../src/memory-store';
import TweekRepository from '../../src/tweek-repository';
import { ITweekStore, RefreshErrorPolicy } from '../../src/types';
import waitPort = require('wait-port');

chai.use(sinonChai);
chai.use(chaiAsPromise);
const { expect } = chai;

const cachedItem = (value?: any) => ({ value, state: 'cached', isScan: value === undefined });

function delay(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

type InitRepoConfig = {
  store?: ITweekStore;
  client?: ITweekClient;
  context?: Context;
};

describe('tweek repo test', () => {
  let _defaultClient: ITweekClient;
  let _createClientThatFails: () => ITweekClient;
  let _tweekRepo: TweekRepository;

  async function refreshAndWait(keys?: string[]) {
    _tweekRepo.expire(keys);
    await (<any>_tweekRepo).waitRefreshCycle();
  }

  function observeKey(key, count = 1, getPolicy?): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let subscription;
      const items: any[] = [];
      _tweekRepo.observe(key, getPolicy).subscribe({
        start: s => (subscription = s),
        next: value => {
          items.push(value);
          if (items.length === count) {
            subscription.unsubscribe();
            resolve(items);
          }
        },
        error: err => {
          subscription.unsubscribe();
          reject(err);
        },
      });
    });
  }

  async function initRepository({ store, client = _defaultClient, context }: InitRepoConfig = {}) {
    _tweekRepo = new TweekRepository({ client, refreshDelay: 2 });
    if (store) {
      await _tweekRepo.useStore(store);
    }
    if (context) {
      _tweekRepo.context = context;
    }
  }

  beforeEach(done => {
    TweekServer.start(1234);

    http
      .get()
      .to('/api/v1/keys/_/*')
      .willReturn({
        'my_path/string_value': 'my-string',
        'my_path/inner_path_1/int_value': 55,
        'my_path/inner_path_1/bool_positive_value': true,
        'my_path/inner_path_2/bool_negative_value': false,
        'some_path/inner_path_1/first_value': 'value_1',
        'some_path/inner_path_1/second_value': 'value_2',
        'deeply_nested/a/b/c/d/value': 'value_5',
        'some_other_path/inner_path_2/third_value': 'value_3',
      });

    _createClientThatFails = () => {
      http
        .get()
        .to('/api/v1/keys/_/*')
        .willFail(500);
      return createTweekClient({ baseServiceUrl: 'http://localhost:1234/' });
    };

    _defaultClient = createTweekClient({ baseServiceUrl: 'http://localhost:1234/' });
    waitPort({ host: 'localhost', port: 1234, output: 'silent' }).then(() => done());
  });

  afterEach(() => {
    TweekServer.stop(1234);
  });

  describe('context', () => {
    describe('context setter', () => {
      it('should replace context sucessfully', async () => {
        // Arrange
        const initialContext: Context = {
          testEntity: { someProperty: 'old context' },
        };

        await initRepository({
          context: initialContext,
        });

        const expectedContext: Context = {
          testEntity: { someNewProperty: 'new context' },
        };

        // Act
        _tweekRepo.context = expectedContext;

        // Assert
        expect(_tweekRepo.context).to.deep.equal(expectedContext, 'should replace context');
      });
    });

    describe('context getter', () => {
      it('should return cloned context', async () => {
        // Arrange
        const initialContext: Context = {
          testEntity: { someProperty: 'some value' },
        };

        await initRepository({ context: initialContext });
        const context = _tweekRepo.context;

        // Act
        context.testEntity.someProperty = 'some manipulated value';

        const actualContext = _tweekRepo.context;

        // Assert
        expect(actualContext).to.deep.equal(initialContext, 'should not be able change the context');
      });
    });

    describe('appendContext', () => {
      it('should append context sucessfully', async () => {
        // Arrange
        const initialContext: Context = {
          testEntity: { someProperty: 'some value' },
        };

        await initRepository({
          context: initialContext,
        });

        const contextToAppend: Context = {
          testEntity: { someNewProperty: 'some new value' },
          testEntity2: { someProperty: 'value' },
        };

        const expectedContext: Context = {
          ...initialContext,
          ...contextToAppend,
        };

        // Act
        _tweekRepo.appendContext(contextToAppend);

        // Assert
        expect(_tweekRepo.context).to.deep.equal(expectedContext, 'should append context');
      });
    });
  });

  describe('retrieve', () => {
    it('should get single key', async () => {
      // Arrange
      await initRepository();

      await _tweekRepo.prepare('my_path/string_value');
      await _tweekRepo.prepare('my_path/inner_path_1/int_value');
      await _tweekRepo.prepare('my_path/inner_path_1/bool_positive_value');
      await _tweekRepo.prepare('my_path/inner_path_2/bool_negative_value');

      await refreshAndWait();

      // Act
      let key1 = await _tweekRepo.get('my_path/string_value');
      let key2 = await _tweekRepo.get('my_path/inner_path_1/int_value');
      let key3 = await _tweekRepo.get('my_path/inner_path_1/bool_positive_value');
      let key4 = await _tweekRepo.get('my_path/inner_path_2/bool_negative_value');

      // Assert
      expect(key1.value).to.equal('my-string');
      expect(key2.value).to.equal(55);
      expect(key3.value).to.equal(true);
      expect(key4.value).to.equal(false);
    });

    it('should get keys node', async () => {
      // Arrange
      await initRepository();

      await _tweekRepo.prepare('some_path/_');
      await refreshAndWait();

      const expectedKeysNode = {
        innerPath1: {
          firstValue: 'value_1',
          secondValue: 'value_2',
        },
      };

      // Act
      let keysNode = await _tweekRepo.get('some_path/_');

      // Assert
      expect(keysNode).to.deep.equal(expectedKeysNode);
    });

    it('should get scan result', async () => {
      // Arrange
      await initRepository();
      await _tweekRepo.prepare('some_path/_');
      await refreshAndWait();

      // Act
      let config = await _tweekRepo.get('some_path/_');

      // Assert
      expect(config.innerPath1.firstValue).to.equal('value_1');
      expect(config.innerPath1.secondValue).to.equal('value_2');
    });

    it('should get scan result deeply nested', async () => {
      // Arrange
      await initRepository();
      await _tweekRepo.prepare('deeply_nested/_');
      await refreshAndWait();

      // Act
      let config = await _tweekRepo.get('deeply_nested/a/b/_');

      // Assert
      expect(config.c.d.value).to.equal('value_5');
    });

    it('should get root scan', async () => {
      // Arrange
      await initRepository();
      await _tweekRepo.prepare('_');
      await refreshAndWait();

      // Act
      let config = await _tweekRepo.get('_');

      // Assert
      expect(config.innerPath1.firstValue).to.equal('value_1');
    });

    it('should get single key after scan prepare', async () => {
      // Arrange
      await initRepository();
      _tweekRepo.prepare('some_path/_');

      await refreshAndWait();

      // Act
      let key = await _tweekRepo.get('some_path/inner_path_1/first_value');

      // Assert
      expect(key.value).to.eql('value_1');
    });

    it('should be case insensitive', async () => {
      // Arrange
      await initRepository();

      await _tweekRepo.prepare('my_Path/string_value');
      await _tweekRepo.prepare('my_path/inneR_path_1/int_value');
      await _tweekRepo.prepare('my_path/inner_path_1/bool_Positive_value');
      await _tweekRepo.prepare('my_path/inner_path_2/bool_negative_Value');

      await refreshAndWait();

      // Act
      let key1 = await _tweekRepo.get('My_path/string_value');
      let key2 = await _tweekRepo.get('my_Path/inner_path_1/int_value');
      let key3 = await _tweekRepo.get('my_path/Inner_path_1/bool_positive_value');
      let key4 = await _tweekRepo.get('my_path/inner_path_2/Bool_negative_value');

      // Assert
      expect(key1.value).to.equal('my-string');
      expect(key2.value).to.equal(55);
      expect(key3.value).to.equal(true);
      expect(key4.value).to.equal(false);
    });
  });

  describe('getPolicy', () => {
    describe('notReady', () => {
      it("should throw when not ready and policy is 'throw'", async () => {
        // Arrange
        await initRepository();
        await _tweekRepo.prepare('path/that/was/not_ready');

        // Act
        const getPromise = _tweekRepo.get('path/that/was/not_ready', { notReady: 'throw' });

        // Assert
        await expect(getPromise).to.be.rejectedWith('value not available yet');
      });

      it("should only refresh the requested key when policy is 'wait'", async () => {
        // Arrange
        let store = new MemoryStore({ 'my_path/inner_path_1/int_value': cachedItem(10) });
        await initRepository({ store });
        await _tweekRepo.prepare('my_path/string_value');

        // Act
        let key1 = await _tweekRepo.get('my_path/string_value', { notReady: 'wait' });
        let key2 = await _tweekRepo.get('my_path/inner_path_1/int_value', { notReady: 'throw' });

        // Assert
        expect(key1.value).to.equal('my-string');
        expect(key2.value).to.equal(10);
      });
    });

    describe('notPrepared', () => {
      it("should throw when not prepared and policy is 'throw'", async () => {
        // Arrange
        await initRepository();
        const keyPath = 'my_path/string_value';

        // Act
        const getPromise = _tweekRepo.get(keyPath, { notPrepared: 'throw' });

        // Assert
        await expect(getPromise).to.be.rejectedWith(`key ${keyPath} not managed, use prepare to add it to cache`);
      });

      it("should get key if not prepared and policy is 'prepare'", async () => {
        // Arrange
        await initRepository();

        //Act
        let key1 = await _tweekRepo.get('my_path/string_value', { notPrepared: 'prepare' });

        //Assert
        expect(key1.value).to.equal('my-string');
      });
    });
  });

  describe('persistence', () => {
    it('should persist to store after refresh', async () => {
      // Arrange
      const store = new MemoryStore();
      await initRepository({ store });
      await _tweekRepo.prepare('some_path/inner_path_1/_');

      // Act
      await refreshAndWait();

      // Assert
      const persistedResult = await store.load();
      expect(persistedResult['some_path/inner_path_1/_'].isScan).to.equal(true);
      expect(persistedResult['some_path/inner_path_1/first_value'].value).to.equal('value_1');
      expect(persistedResult['some_path/inner_path_1/second_value'].value).to.equal('value_2');
    });

    it('should load persisted key', async () => {
      // Arrange
      const persistedNodes = {
        'some_path/inner_path_1/first_value': cachedItem('value_1'),
      };
      const store = new MemoryStore(persistedNodes);
      await initRepository({ store });

      // Act
      let key = await _tweekRepo.get('some_path/inner_path_1/first_value');

      // Assert
      expect(key.value).to.equal('value_1');
    });

    it('should load persisted scan', async () => {
      // Arrange
      const persistedNodes = {
        'some_path/_': cachedItem(),
        'some_path/inner_path_1/_': cachedItem(),
        'some_path/inner_path_1/first_value': cachedItem('value_1'),
        'some_path/inner_path_1/second_value': cachedItem('value_2'),
      };
      const store = new MemoryStore(persistedNodes);
      await initRepository({ store });

      // Act & Assert
      const result1 = await _tweekRepo.get('some_path/inner_path_1/_');
      expect(result1).to.eql({ firstValue: 'value_1', secondValue: 'value_2' });

      const result2 = await _tweekRepo.get('some_path/_');
      expect(result2).to.eql({ innerPath1: { firstValue: 'value_1', secondValue: 'value_2' } });
    });

    it('should load single key from persistence and update key after refresh', async () => {
      // Arrange
      const persistedNodes = {
        'some_path/inner_path_1/first_value': cachedItem('old_value'),
      };

      const store = new MemoryStore(persistedNodes);
      await initRepository({ store });

      // Act & assert
      let old = await _tweekRepo.get('some_path/inner_path_1/first_value');
      expect(old.value).to.eql('old_value');

      await refreshAndWait();
      await new Promise(setImmediate);

      let _new = await _tweekRepo.get('some_path/inner_path_1/first_value');
      expect(_new.value).to.eql('value_1');
    });
  });

  describe('add flat keys', () => {
    it('should add flat key and update it after refresh', async () => {
      await initRepository();
      const keys = {
        'some_path/inner_path_1/first_value': 'default_value',
      };
      _tweekRepo.addKeys(keys);

      const result1 = await _tweekRepo.get('some_path/inner_path_1/first_value');
      expect(result1.value).to.eql('default_value');

      await refreshAndWait();
      const result2 = await _tweekRepo.get('some_path/inner_path_1/first_value');
      expect(result2.value).to.eql('value_1');
    });
  });

  describe('refresh', () => {
    it('should not do fetch request if there are no requested keys', async () => {
      // Arrange
      const fetchStub = sinon.stub();
      const clientMock: ITweekClient = {
        fetch: <any>fetchStub,
        appendContext: sinon.stub(),
        deleteContext: sinon.stub(),
      };

      await initRepository({ client: clientMock });

      // Act
      const refreshPromise = refreshAndWait();
      await refreshPromise;

      // Assert
      expect(fetchStub).to.have.not.been.called;
      await expect(refreshPromise).to.eventually.equal(undefined, 'should not return any keys');
    });

    it('should call client fetch with all current keys', async () => {
      // Arrange
      const fetchStub = sinon.stub().resolves({});
      const clientMock: ITweekClient = {
        fetch: <any>fetchStub,
        appendContext: sinon.stub(),
        deleteContext: sinon.stub(),
      };
      const expectedContext = { identity: { prop: 'value' } };

      await initRepository({ client: clientMock, context: expectedContext });

      const expectedKeys = ['some_path1/_', 'some_path2/key1', 'some_path3/key2'];
      expectedKeys.forEach(key => _tweekRepo.prepare(key));

      const expectedFetchConfig: FetchConfig = {
        flatten: true,
        casing: 'snake',
        context: <any>expectedContext,
        include: expectedKeys,
      };

      // Act
      await refreshAndWait();

      // Assert
      expect(fetchStub).to.have.been.calledOnce;

      const fetchParameters = fetchStub.args[0];
      const [fetchUrl, fetchConfig] = fetchParameters;
      expect(fetchUrl).to.eql('_');
      expect(fetchConfig).to.eql(expectedFetchConfig);
    });

    it('should throw error when fetch fails', async () => {
      // Arrange
      await initRepository({ client: _createClientThatFails() });
      await _tweekRepo.prepare('some_path/key');

      // Act
      const refreshPromise = refreshAndWait();

      //Assert
      await expect(refreshPromise).to.be.eventually.eql(undefined);
    });

    it('should remove key if missing after refresh', async () => {
      //Arrange
      let store = new MemoryStore({ 'some_key/should_be_removed': cachedItem('some_value') });
      await initRepository({ store });

      //Act
      await refreshAndWait();
      const key = await _tweekRepo.get('some_key/should_be_removed');

      //Assert
      expect(key).to.deep.include({ value: undefined, hasValue: false });
    });

    it('should refresh expired keys when using store', async () => {
      // Arrange
      const persistedNodes = {
        'my_path/string_value': { state: 'cached', value: 'old-value', expiration: 'expired' },
        'my_path/inner_path_1/int_value': { state: 'cached', value: 10, expiration: 'refreshing' },
        'some_path/inner_path_1/first_value': cachedItem(''),
      };
      let store = new MemoryStore(persistedNodes);
      await initRepository({ store });
      await refreshAndWait(['some_path/inner_path_1/first_value']);

      // Act
      let key1 = await _tweekRepo.get('my_path/string_value');
      let key2 = await _tweekRepo.get('my_path/inner_path_1/int_value');
      let key3 = await _tweekRepo.get('some_path/inner_path_1/first_value');

      // Assert
      expect(key1.value).to.equal('my-string');
      expect(key2.value).to.equal(55);
      expect(key3.value).to.equal('value_1');
    });

    it('should batch all the refresh requests together', async () => {
      const persistedNodes = {
        key1: cachedItem(1),
        key2: cachedItem(1),
        key3: cachedItem(1),
      };
      let store = new MemoryStore(persistedNodes);

      const fetchPromise = () => delay(15).then(() => ({}));

      const fetchStub = sinon.stub();
      fetchStub.resolves(fetchPromise());

      const clientMock: ITweekClient = {
        fetch: <any>fetchStub,
        appendContext: sinon.stub(),
        deleteContext: sinon.stub(),
      };

      await initRepository({ client: clientMock, store });

      await refreshAndWait(['key1', 'key2']);

      expect(fetchStub).to.have.been.calledOnce;

      _tweekRepo.refresh(['key1']);
      await refreshAndWait(['key2', 'key3']);

      expect(fetchStub).to.have.been.calledTwice;
    });

    it('should refresh keys in next cycle if first one failed', async () => {
      const persistedNodes = {
        key1: cachedItem(1),
        key2: cachedItem(1),
        key3: cachedItem(1),
      };
      const store = new MemoryStore(persistedNodes);

      const fetchStub = sinon.stub();
      fetchStub.onCall(0).rejects();
      fetchStub.resolves(Object.keys(persistedNodes).reduce((acc, key) => ({ ...acc, [key]: 2 }), {}));

      const clientMock: ITweekClient = {
        fetch: <any>fetchStub,
        appendContext: sinon.stub(),
        deleteContext: sinon.stub(),
      };

      await initRepository({ client: clientMock, store });
      let recover;
      (<any>_tweekRepo)._refreshErrorPolicy = (resume, retryCount, err) => {
        recover = resume;
      };

      await refreshAndWait();

      await Promise.all(
        Object.keys(persistedNodes).map(async key => {
          const keyValue = await _tweekRepo.get(key);
          expect(keyValue.value).to.equal(1);
        }),
      );

      recover();
      await new Promise(resolve => setTimeout(resolve, 10));

      await Promise.all(
        Object.keys(persistedNodes).map(async key => {
          const keyValue = await _tweekRepo.get(key);
          expect(keyValue.value).to.equal(2);
        }),
      );
    });

    it('should pass the right arguments to error policy and behave correctly', async () => {
      const store = new MemoryStore({});

      const fetchStub = sinon.stub();
      fetchStub.onCall(0).rejects('someError');
      fetchStub.onCall(1).rejects();
      fetchStub.onCall(2).resolves({ test1: 1 });
      fetchStub.onCall(3).rejects();
      fetchStub.onCall(4).resolves({ test1: 2 });

      const clientMock: ITweekClient = {
        fetch: <any>fetchStub,
        appendContext: sinon.stub(),
        deleteContext: sinon.stub(),
      };

      await initRepository({ client: clientMock, store });
      _tweekRepo.addKeys({ test1: 0 });
      const readValue = async () => (await _tweekRepo.get('test1')).value;

      let recover;
      let retryCounts: number[] = [];
      let errors: Error[] = [];
      let policy: RefreshErrorPolicy = (resume, retryCount, err) => {
        recover = resume;
        retryCounts.push(retryCount);
        err && errors.push(err);
      };

      (<any>_tweekRepo)._refreshErrorPolicy = policy;

      await refreshAndWait();
      expect(await readValue()).to.eql(0);
      recover();
      await new Promise(setImmediate);
      recover();
      await new Promise(setImmediate);
      await refreshAndWait();
      expect(await readValue()).to.eql(1);
      recover();
      await new Promise(setImmediate);
      expect(await readValue()).to.eql(2);

      expect(retryCounts).to.eql([1, 2, 1]);
      expect(errors[0].name).to.eql('someError');
    });

    it('there should be only one running instance of refresh policy', async () => {
      const store = new MemoryStore({});

      const fetchStub = sinon.stub();
      fetchStub.onCall(0).rejects('someError');
      fetchStub.onCall(1).resolves({ test1: 1 });

      const clientMock: ITweekClient = {
        fetch: <any>fetchStub,
        appendContext: sinon.stub(),
        deleteContext: sinon.stub(),
      };

      await initRepository({ client: clientMock, store });
      _tweekRepo.addKeys({ test1: 0 });

      let calls = 0;
      let recover;
      let policy: RefreshErrorPolicy = (resume, retryCount, err) => {
        recover = resume;
        calls++;
      };

      (<any>_tweekRepo)._refreshErrorPolicy = policy;
      const readValue = async () => (await _tweekRepo.get('test1')).value;

      expect(await readValue()).to.eql(0);
      await refreshAndWait();
      expect(await readValue()).to.eql(0);
      await refreshAndWait();
      await refreshAndWait();
      await refreshAndWait();
      await refreshAndWait();
      await refreshAndWait();
      await refreshAndWait();
      expect(calls).to.eql(1);
      recover();
      await new Promise(setImmediate);
      expect(await readValue()).to.eql(1);
    });

    it('should not refresh if not dirty', async () => {
      await initRepository();

      const spy = sinon.spy((<any>_tweekRepo)._cache, 'list');

      try {
        await delay(10);
        expect(spy.notCalled).to.be.true;
      } finally {
        (<any>_tweekRepo)._cache.list.restore();
      }
    });
  });

  describe('observe', () => {
    it('should observe single key', async () => {
      // Arrange
      await initRepository();

      await _tweekRepo.prepare('my_path/string_value');
      await _tweekRepo.prepare('my_path/inner_path_1/int_value');
      await _tweekRepo.prepare('my_path/inner_path_1/bool_positive_value');
      await _tweekRepo.prepare('my_path/inner_path_2/bool_negative_value');

      await refreshAndWait();

      // Act
      let [key1] = await observeKey('my_path/string_value');
      let [key2] = await observeKey('my_path/inner_path_1/int_value');
      let [key3] = await observeKey('my_path/inner_path_1/bool_positive_value');
      let [key4] = await observeKey('my_path/inner_path_2/bool_negative_value');

      // Assert
      expect(key1).to.have.property('value', 'my-string');
      expect(key2).to.have.property('value', 55);
      expect(key3).to.have.property('value', true);
      expect(key4).to.have.property('value', false);
    });

    it('should observe scan key', async () => {
      // Arrange
      await initRepository();

      await _tweekRepo.prepare('some_path/_');
      await refreshAndWait();

      const expectedKeysNode = {
        innerPath1: {
          firstValue: 'value_1',
          secondValue: 'value_2',
        },
      };

      // Act
      let [keysNode] = await observeKey('some_path/_');

      // Assert
      expect(keysNode).to.deep.equal(expectedKeysNode);
    });

    it('should observe root scan', async () => {
      // Arrange
      await initRepository();
      await _tweekRepo.prepare('_');
      await refreshAndWait();

      // Act
      let [config] = await observeKey('_');

      // Assert
      expect(config)
        .to.have.property('innerPath1')
        .that.deep.include({ firstValue: 'value_1' });
    });

    it('should be case insensitive', async () => {
      // Arrange
      await initRepository();

      await _tweekRepo.prepare('my_Path/string_value');
      await _tweekRepo.prepare('my_path/inneR_path_1/int_value');
      await _tweekRepo.prepare('my_path/inner_path_1/bool_Positive_value');
      await _tweekRepo.prepare('my_path/inner_path_2/bool_negative_Value');

      await refreshAndWait();

      // Act
      let [key1] = await observeKey('My_path/string_value');
      let [key2] = await observeKey('my_Path/inner_path_1/int_value');
      let [key3] = await observeKey('my_path/Inner_path_1/bool_positive_value');
      let [key4] = await observeKey('my_path/inner_path_2/Bool_negative_value');

      // Assert
      expect(key1).to.have.property('value', 'my-string');
      expect(key2).to.have.property('value', 55);
      expect(key3).to.have.property('value', true);
      expect(key4).to.have.property('value', false);
    });

    it('should notify after refresh new value', async () => {
      const persistedNodes = {
        'my_path/string_value': cachedItem('old-value'),
      };
      const store = new MemoryStore(persistedNodes);
      await initRepository({ store });
      const keysPromise = observeKey('my_path/string_value', 2);

      await refreshAndWait();

      const keys = await keysPromise;
      expect(keys).to.have.lengthOf(2);
      expect(keys.map(x => x.value)).to.deep.equal(['old-value', 'my-string']);
    });

    it('should call error when fetch fails', async () => {
      // Arrange
      await initRepository({ client: _createClientThatFails() });

      // Act
      const keysPromise = observeKey('some_path/key', 1, { notPrepared: 'throw' });

      //Assert
      await expect(keysPromise).to.be.rejected;
    });

    it('should stop notifying after unsubscribe', async () => {
      const persistedNodes = {
        'my_path/string_value': cachedItem('old-value'),
      };
      const store = new MemoryStore(persistedNodes);
      await initRepository({ store });

      const items: any[] = [];
      const subscription = _tweekRepo.observe('my_path/string_value').subscribe({
        next: x => items.push(x.value),
        error: () => subscription.unsubscribe(),
      });

      subscription.unsubscribe();

      await refreshAndWait();

      expect(items).to.have.lengthOf(1);
      expect(items).to.deep.equal(['old-value']);
    });
  });
});

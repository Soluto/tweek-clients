import 'mocha';
import chai from 'chai';
import sinon from 'sinon';
import chaiAsPromise from 'chai-as-promised';
import { FakeServer } from 'simple-fake-server';
import { Context, createTweekClient, GetValuesConfig, ITweekClient } from 'tweek-client';
import {
  Expiration,
  ITweekStore,
  MemoryStore,
  RefreshErrorPolicy,
  RepositoryKeyState,
  StoredKey,
  TweekRepository,
} from '../../src';

const waitPort: any = require('wait-port');

chai.use(chaiAsPromise);
const { expect } = chai;

const cachedItem = (value?: any, expiration?: Expiration): StoredKey<any> =>
  <any>{
    value,
    state: RepositoryKeyState.cached,
    isScan: value === undefined,
    expiration,
  };

function delay(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
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
  let _tweekServer: FakeServer;

  async function refreshAndWait(keys?: string[]) {
    _tweekRepo.expire(keys);
    await _tweekRepo.waitRefreshCycle();
  }

  async function initRepository({ store, client = _defaultClient, context }: InitRepoConfig = {}) {
    _tweekRepo = new TweekRepository({ client, refreshDelay: 2, context });
    if (store) {
      await _tweekRepo.useStore(store);
    }
  }

  before(() => {
    _tweekServer = new FakeServer(1234);
    _tweekServer.start();
  });

  after(() => {
    _tweekServer.stop();
  });

  beforeEach((done) => {
    _tweekServer.http.get().to('/api/v2/values/_/*').willReturn({
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
      _tweekServer.http.get().to('/api/v2/values/_/*').willFail(500);
      return createTweekClient({ baseServiceUrl: 'http://localhost:1234/' });
    };

    _defaultClient = createTweekClient({ baseServiceUrl: 'http://localhost:1234/' });
    waitPort({ host: 'localhost', port: 1234, output: 'silent' }).then(() => done());
  });

  describe('retrieve', () => {
    describe('getValue', () => {
      it('should get single key', async () => {
        // Arrange
        await initRepository();

        const expected = {
          'my_path/string_value': 'my-string',
          'my_path/inner_path_1/int_value': 55,
          'my_path/inner_path_1/bool_positive_value': true,
          'my_path/inner_path_2/bool_negative_value': false,
        };

        await Promise.all(Object.keys(expected).map((key) => _tweekRepo.prepare(key)));

        await refreshAndWait();

        for (const [key, expectedValue] of Object.entries(expected)) {
          // Act
          const value = await _tweekRepo.getValue(key);

          // Assert
          expect(value).to.equal(expectedValue);
        }
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
        const value = await _tweekRepo.getValue('some_path/_');

        // Assert
        expect(value).to.deep.equal(expectedKeysNode);
      });

      it('should get scan result', async () => {
        // Arrange
        await initRepository();
        await _tweekRepo.prepare('some_path/_');
        await refreshAndWait();

        // Act
        const value = await _tweekRepo.getValue('some_path/_');

        // Assert
        expect(value).to.deep.include({
          innerPath1: {
            firstValue: 'value_1',
            secondValue: 'value_2',
          },
        });
      });

      it('should get scan result deeply nested', async () => {
        // Arrange
        await initRepository();
        await _tweekRepo.prepare('deeply_nested/_');
        await refreshAndWait();

        // Act
        const value = await _tweekRepo.getValue('deeply_nested/a/b/_');

        // Assert
        expect(value).to.deep.include({ c: { d: { value: 'value_5' } } });
      });

      it('should get root scan', async () => {
        // Arrange
        await initRepository();
        await _tweekRepo.prepare('_');
        await refreshAndWait();

        // Act
        const value = await _tweekRepo.getValue('_');

        // Assert
        expect(value)
          .to.have.property('somePath')
          .that.has.property('innerPath1')
          .that.deep.include({ firstValue: 'value_1' });
      });

      it('should get single key after scan prepare', async () => {
        // Arrange
        await initRepository();
        _tweekRepo.prepare('some_path/_');

        await refreshAndWait();

        // Act
        const value = await _tweekRepo.getValue('some_path/inner_path_1/first_value');

        // Assert
        expect(value).to.eql('value_1');
      });

      it('should get missing key', async () => {
        // Arrange
        await initRepository();
        await _tweekRepo.prepare('some_path/missing_key');
        await refreshAndWait();

        // Act
        const value = await _tweekRepo.getValue('some_path/missing_key');

        // Assert
        expect(value).to.eql(undefined);
      });

      it('should be case insensitive', async () => {
        // Arrange
        await initRepository();

        await _tweekRepo.prepare('my_Path/string_value');
        await _tweekRepo.prepare('my_path/inneR_path_1/int_value');
        await _tweekRepo.prepare('my_path/inner_path_1/bool_Positive_value');
        await _tweekRepo.prepare('my_path/inner_path_2/bool_negative_Value');

        await refreshAndWait();

        const expected = {
          'My_path/string_value': 'my-string',
          'my_Path/inner_patH_1/int_value': 55,
          'my_path/Inner_path_1/bool_positive_value': true,
          'my_path/inner_path_2/Bool_negative_value': false,
        };

        for (const [key, expectedValue] of Object.entries(expected)) {
          // Act
          const value = await _tweekRepo.getValue(key);

          // Assert
          expect(value).to.equal(expectedValue);
        }
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
      const value = await _tweekRepo.getValue('some_path/inner_path_1/first_value');

      // Assert
      expect(value).to.equal('value_1');
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
      const result1 = await _tweekRepo.getValue('some_path/inner_path_1/_');
      expect(result1).to.eql({ firstValue: 'value_1', secondValue: 'value_2' });

      const result2 = await _tweekRepo.getValue('some_path/_');
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
      const old = await _tweekRepo.getValue('some_path/inner_path_1/first_value');
      expect(old).to.eql('old_value');

      await refreshAndWait();
      await new Promise(setImmediate);

      const _new = await _tweekRepo.getValue('some_path/inner_path_1/first_value');
      expect(_new).to.eql('value_1');
    });

    it('should call error when store is corrupted', async () => {
      // Arrange
      await initRepository();

      // Act
      const loadPromise = _tweekRepo.useStore(new MemoryStore({ 'some_path/key': cachedItem() }));

      //Assert
      await expect(loadPromise).to.be.rejected;
    });
  });

  describe('add flat keys', () => {
    it('should add flat key and update it after refresh', async () => {
      await initRepository();
      const keys = {
        'some_path/inner_path_1/first_value': 'default_value',
      };
      _tweekRepo.addKeys(keys);

      const result1 = await _tweekRepo.getValue('some_path/inner_path_1/first_value');
      expect(result1).to.eql('default_value');

      await refreshAndWait();
      const result2 = await _tweekRepo.getValue('some_path/inner_path_1/first_value');
      expect(result2).to.eql('value_1');
    });
  });

  describe('expire', () => {
    it('should not do fetch request if there are no requested keys', async () => {
      // Arrange
      const fetchStub = sinon.stub();
      const clientMock: ITweekClient = {
        getValues: <any>fetchStub,
        getValuesWithDetails: <any>fetchStub,
      };

      await initRepository({ client: clientMock });

      // Act
      const refreshPromise = refreshAndWait();
      await refreshPromise;

      // Assert
      sinon.assert.notCalled(fetchStub);
      await expect(refreshPromise).to.eventually.equal(undefined, 'should not return any keys');
    });

    it('should call client fetch with all current keys', async () => {
      // Arrange
      const fetchStub = sinon.stub().resolves({});
      const clientMock: ITweekClient = {
        getValues: <any>fetchStub,
        getValuesWithDetails: <any>fetchStub,
      };
      const expectedContext = { identity: { prop: 'value' } };

      await initRepository({ client: clientMock, context: expectedContext });

      const expectedKeys = ['some_path1/_', 'some_path2/key1', 'some_path3/key2'];
      expectedKeys.forEach((key) => _tweekRepo.prepare(key));

      const expectedFetchConfig: GetValuesConfig = {
        flatten: true,
        // @ts-ignore legacy support
        casing: 'snake',
        context: <any>expectedContext,
        include: expectedKeys,
      };

      // Act
      await refreshAndWait();

      // Assert
      sinon.assert.calledOnce(fetchStub);

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
      const key = await _tweekRepo.getValue('some_key/should_be_removed');

      //Assert
      expect(key).to.eql(undefined);
    });

    it('should refresh expired keys when using store', async () => {
      // Arrange
      const persistedNodes = {
        'my_path/string_value': cachedItem('old-value', Expiration.expired),
        'my_path/inner_path_1/int_value': cachedItem(10, Expiration.refreshing),
        'some_path/inner_path_1/first_value': cachedItem(''),
      };
      let store = new MemoryStore(persistedNodes);
      await initRepository({ store });
      await refreshAndWait(['some_path/inner_path_1/first_value']);

      const expected = {
        'my_path/string_value': 'my-string',
        'my_path/inner_path_1/int_value': 55,
        'some_path/inner_path_1/first_value': 'value_1',
      };

      for (const [key, expectedValue] of Object.entries(expected)) {
        // Act
        const value = await _tweekRepo.getValue(key);

        // Assert
        expect(value).to.equal(expectedValue);
      }
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
        getValues: <any>fetchStub,
        getValuesWithDetails: <any>fetchStub,
      };

      await initRepository({ client: clientMock, store });

      await refreshAndWait(['key1', 'key2']);

      sinon.assert.calledOnce(fetchStub);

      _tweekRepo.expire(['key1']);
      await refreshAndWait(['key2', 'key3']);

      sinon.assert.calledTwice(fetchStub);
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
        getValues: <any>fetchStub,
        getValuesWithDetails: <any>fetchStub,
      };

      await initRepository({ client: clientMock, store });
      let recover: Function;
      (<any>_tweekRepo)._refreshErrorPolicy = (resume: Function) => {
        recover = resume;
      };

      await refreshAndWait();

      await Promise.all(
        Object.keys(persistedNodes).map(async (key) => {
          const keyValue = await _tweekRepo.getValue(key);
          expect(keyValue).to.equal(1);
        }),
      );

      recover!();
      await new Promise((resolve) => setTimeout(resolve, 10));

      await Promise.all(
        Object.keys(persistedNodes).map(async (key) => {
          const keyValue = await _tweekRepo.getValue(key);
          expect(keyValue).to.equal(2);
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
        getValues: <any>fetchStub,
        getValuesWithDetails: <any>fetchStub,
      };

      await initRepository({ client: clientMock, store });
      _tweekRepo.addKeys({ test1: 0 });
      const readValue = () => _tweekRepo.getValue('test1');

      let recover: Function;
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
      recover!();
      await new Promise(setImmediate);
      recover!();
      await new Promise(setImmediate);
      await refreshAndWait();
      expect(await readValue()).to.eql(1);
      recover!();
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
        getValues: <any>fetchStub,
        getValuesWithDetails: <any>fetchStub,
      };

      await initRepository({ client: clientMock, store });
      _tweekRepo.addKeys({ test1: 0 });

      let calls = 0;
      let recover: Function;
      let policy: RefreshErrorPolicy = (resume) => {
        recover = resume;
        calls++;
      };

      (<any>_tweekRepo)._refreshErrorPolicy = policy;
      const readValue = () => _tweekRepo.getValue('test1');

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
      recover!();
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

  describe('observeValue', () => {
    function observeKey(key: string, count = 1): Promise<any[]> {
      return new Promise((resolve, reject) => {
        const items: any[] = [];
        const subscription = _tweekRepo.observeValue(key).subscribe({
          next: (value) => {
            items.push(value);
            if (items.length === count) {
              subscription.unsubscribe();
              resolve(items);
            }
          },
          error: (err) => {
            subscription.unsubscribe();
            reject(err);
          },
        });
      });
    }

    it('should observe single key', async () => {
      // Arrange
      await initRepository();

      const expected = {
        'my_path/string_value': 'my-string',
        'my_path/inner_path_1/int_value': 55,
        'my_path/inner_path_1/bool_positive_value': true,
        'my_path/inner_path_2/bool_negative_value': false,
      };

      await Promise.all(Object.keys(expected).map((key) => _tweekRepo.prepare(key)));

      await refreshAndWait();

      for (const [key, expectedValue] of Object.entries(expected)) {
        // Act
        const [value] = await observeKey(key);

        // Assert
        expect(value).to.equal(expectedValue);
      }
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
        .to.have.property('somePath')
        .that.has.property('innerPath1')
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

      const expected = {
        'My_path/string_value': 'my-string',
        'my_Path/inner_patH_1/int_value': 55,
        'my_path/Inner_path_1/bool_positive_value': true,
        'my_path/inner_path_2/Bool_negative_value': false,
      };

      for (const [key, expectedValue] of Object.entries(expected)) {
        // Act
        const [value] = await observeKey(key);

        // Assert
        expect(value).to.equal(expectedValue);
      }
    });

    it('should notify after refresh new value', async () => {
      // Arrange
      const persistedNodes = {
        'my_path/string_value': cachedItem('old-value'),
      };
      const store = new MemoryStore(persistedNodes);
      await initRepository({ store });

      // Act
      const valuesPromise = observeKey('my_path/string_value', 2);
      await refreshAndWait();

      // Assert
      const values = await valuesPromise;
      expect(values).to.have.lengthOf(2);
      expect(values).to.deep.equal(['old-value', 'my-string']);
    });

    it('should stop notifying after unsubscribe', async () => {
      // Arrange
      const persistedNodes = {
        'my_path/string_value': cachedItem('old-value'),
      };
      const store = new MemoryStore(persistedNodes);
      await initRepository({ store });

      const items: any[] = [];
      const subscription: ZenObservable.Subscription = _tweekRepo.observeValue('my_path/string_value').subscribe(
        (x) => {
          items.push(x);
          subscription.unsubscribe();
        },
        () => subscription.unsubscribe(),
      );

      // Act
      await refreshAndWait();

      // Assert
      expect(items).to.have.lengthOf(1);
      expect(items).to.deep.equal(['old-value']);
    });

    it('should notify only on updated keys', async () => {
      // Arrange
      await initRepository();
      const callback = sinon.stub();
      const subscription = _tweekRepo.observeValue('my_path/string_value').subscribe(callback);

      // Act
      for (let i = 0; i < 5; i++) {
        await refreshAndWait(['my_path/string_value']);
      }

      subscription.unsubscribe();

      // Assert
      sinon.assert.calledOnce(callback);
    });
  });

  describe('listen', () => {
    it('should notify on addKeys', async () => {
      // Arrange
      await initRepository();
      const callback = sinon.stub();
      const unlisten = _tweekRepo.listen(callback);

      // Act
      _tweekRepo.addKeys({ 'some/key/path': 'some value' });
      unlisten();

      // Assert
      sinon.assert.calledOnce(callback);
      sinon.assert.calledWithExactly(
        callback,
        sinon.match.set.deepEquals(new Set(['some/key/path', 'some/_', 'some/key/_', '_'])),
      );
    });

    it('should notify on useStore', async () => {
      // Arrange
      await initRepository();
      const callback = sinon.stub();
      const unlisten = _tweekRepo.listen(callback);

      // Act
      await _tweekRepo.useStore(new MemoryStore({ 'some/key/path': cachedItem('some value') }));
      unlisten();

      // Assert
      sinon.assert.calledOnce(callback);
      sinon.assert.calledWithExactly(
        callback,
        sinon.match.set.deepEquals(new Set(['some/key/path', 'some/_', 'some/key/_', '_'])),
      );
    });

    it('should notify on refreshed keys', async () => {
      // Arrange
      await initRepository();
      const callback = sinon.stub();
      const unlisten = _tweekRepo.listen(callback);

      // Act
      await refreshAndWait(['my_path/string_value', 'my_path/inner_path_1/_']);
      unlisten();

      // Assert
      sinon.assert.calledOnce(callback);
      sinon.assert.calledWithExactly(
        callback,
        sinon.match.set.deepEquals(
          new Set([
            'my_path/inner_path_1/int_value',
            'my_path/inner_path_1/bool_positive_value',
            'my_path/string_value',
            'my_path/_',
            'my_path/inner_path_1/_',
            '_',
          ]),
        ),
      );
    });

    it('should notify only changed keys', async () => {
      // Arrange
      await initRepository();
      const callback = sinon.stub();
      await refreshAndWait(['my_path/string_value']);
      const unlisten = _tweekRepo.listen(callback);

      // Act
      await refreshAndWait(['my_path/string_value', 'my_path/inner_path_1/_']);
      unlisten();

      // Assert
      sinon.assert.calledOnce(callback);
      sinon.assert.calledWithExactly(
        callback,
        sinon.match.set.deepEquals(
          new Set([
            'my_path/inner_path_1/int_value',
            'my_path/inner_path_1/bool_positive_value',
            'my_path/_',
            'my_path/inner_path_1/_',
            '_',
          ]),
        ),
      );
    });

    it('should stop notifying after unlisten', async () => {
      // Arrange
      await initRepository();
      const callback = sinon.stub();
      const unlisten = _tweekRepo.listen(callback);

      // Act
      await refreshAndWait(['my_path/string_value']);
      unlisten();
      await refreshAndWait(['my_path/string_value', 'my_path/inner_path_1/_']);

      // Assert
      sinon.assert.calledOnce(callback);
      sinon.assert.calledWithExactly(
        callback,
        sinon.match.set.deepEquals(new Set(['my_path/string_value', 'my_path/_', '_'])),
      );
    });
  });
});

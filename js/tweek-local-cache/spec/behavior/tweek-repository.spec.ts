import { expect } from 'chai';
const getenv: any = require('getenv');
import { createTweekClient, ITweekClient, Context } from 'tweek-client';
import axios from 'axios';
import { TweekRepository, MemoryStore } from '../../src';
import { delay } from '../../src/utils';

const TWEEK_GATEWAY_URL = getenv.string('TWEEK_GATEWAY_URL', 'http://127.0.0.1:1111');

describe('tweek repo behavior test', function (this: Mocha.Suite) {
  this.timeout(180000);

  let _tweekRepo: TweekRepository;
  let _tweekClient: ITweekClient;

  before(async () => {
    const instance = axios.create({ baseURL: TWEEK_GATEWAY_URL, timeout: 2000 });

    let error;
    for (let i = 0; i < 20; i++) {
      try {
        await instance.get('/health');
        const result = await instance.get('/api/v2/values/@tweek_clients_tests/_');
        expect(result.data).to.deep.include({
          test_category: { test_key1: 'def value', test_key2: false },
          test_category2: { user_fruit: 'apple' },
        });
        console.log('tweek api ready');
        return;
      } catch (err) {
        error = err;
        console.log('tweek api not ready yet:', err.message);
        await delay(1000);
      }
    }

    throw error;
  });

  async function initTweekRepository(context: Context = {}) {
    _tweekClient = createTweekClient({ baseServiceUrl: TWEEK_GATEWAY_URL });

    const store = new MemoryStore();
    _tweekRepo = new TweekRepository({ client: _tweekClient, context });
    await _tweekRepo.useStore(store);
  }

  const testDefenitions: {
    pathsToPrepare: string[];
    expectedKeys: { keyName: string; value: any }[];
    context: Context;
  }[] = [];

  testDefenitions.push({
    context: {},
    pathsToPrepare: ['@tweek_clients_tests/test_category/test_key1'],
    expectedKeys: [{ keyName: '@tweek_clients_tests/test_category/test_key1', value: 'def value' }],
  });

  testDefenitions.push({
    context: {},
    pathsToPrepare: [
      '@tweek_clients_tests/test_category/test_key1',
      '@tweek_clients_tests/test_category/test_key2',
      '@tweek_clients_tests/test_category2/user_fruit',
    ],
    expectedKeys: [
      { keyName: '@tweek_clients_tests/test_category/test_key1', value: 'def value' },
      { keyName: '@tweek_clients_tests/test_category/test_key2', value: false },
      { keyName: '@tweek_clients_tests/test_category2/user_fruit', value: 'apple' },
    ],
  });

  testDefenitions.push({
    context: {
      device: {
        DeviceOsType: 'Ios',
        PartnerBrandId: 'testPartner',
        DeviceType: 'Desktop',
      },
    },
    pathsToPrepare: [
      '@tweek_clients_tests/test_category/test_key1',
      '@tweek_clients_tests/test_category/test_key2',
      '@tweek_clients_tests/test_category2/user_fruit',
    ],
    expectedKeys: [
      { keyName: '@tweek_clients_tests/test_category/test_key1', value: 'ios value' },
      { keyName: '@tweek_clients_tests/test_category/test_key2', value: true },
      { keyName: '@tweek_clients_tests/test_category2/user_fruit', value: 'orange' },
    ],
  });

  testDefenitions.push({
    context: {
      device: {
        DeviceOsType: 'Ios',
        PartnerBrandId: 'testPartner',
        DeviceType: 'Desktop',
      },
    },
    pathsToPrepare: ['@tweek_clients_tests/test_category/_', '@tweek_clients_tests/test_category2/_'],
    expectedKeys: [
      { keyName: '@tweek_clients_tests/test_category/test_key1', value: 'ios value' },
      { keyName: '@tweek_clients_tests/test_category/test_key2', value: true },
      { keyName: '@tweek_clients_tests/test_category2/user_fruit', value: 'orange' },
    ],
  });

  testDefenitions.push({
    context: {
      device: {
        DeviceType: 'Desktop',
      },
    },
    pathsToPrepare: ['@tweek_clients_tests/_'],
    expectedKeys: [
      { keyName: '@tweek_clients_tests/test_category/test_key1', value: 'def value' },
      { keyName: '@tweek_clients_tests/test_category/test_key2', value: false },
      { keyName: '@tweek_clients_tests/test_category2/user_fruit', value: 'orange' },
    ],
  });

  testDefenitions.forEach((test) =>
    it('should succeed get keys values', async () => {
      // Arrange
      await initTweekRepository(test.context);

      test.pathsToPrepare.forEach((x) => _tweekRepo.prepare(x));

      // Act
      _tweekRepo.expire();
      await _tweekRepo.waitRefreshCycle();
      const values = await Promise.all(test.expectedKeys.map((x) => _tweekRepo.getValue(x.keyName)));

      // Assert
      expect(values).to.deep.equal(test.expectedKeys.map((x) => x.value));
    }),
  );
});

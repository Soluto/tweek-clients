import 'mocha';
import chai = require('chai');
import getenv = require('getenv');
const expect = chai.expect;
import TweekRepository from '../../';
import { MemoryStore } from '../../';
import { createTweekClient, TweekClient, ITweekClient } from '../../../tweek-rest';

const TWEEK_LOCAL_API = getenv.string('TWEEK_LOCAL_API', 'http://api.playground.tweek.host');

describe('tweek repo behavior test', () => {
  let _tweekRepo: TweekRepository;
  let _tweekClient: ITweekClient;

  async function initTweekRepository(context: Object = {}) {
    _tweekClient = createTweekClient("TWEEK_LOCAL_API", context,
      (url: string) => <any>fetch(url).then(r => r.json()));

    const store = new MemoryStore();
    _tweekRepo = new TweekRepository({ client: _tweekClient, store });

    await _tweekRepo.init();
  };

  const testDefenitions: {
    keysToTest: { keyName: string, expectedValue: any }[],
    context: Object
  }[] = [];

  testDefenitions.push({
    context: {},
    keysToTest: [
      { keyName: '@tweek_clients_tests/test_category/test_key1', expectedValue: 'def value' },
      { keyName: '@tweek_clients_tests/test_category/test_key2', expectedValue: false },
      { keyName: '@tweek_clients_tests/test_category2/user_fruit', expectedValue: 'apple' },
    ]
  });

  testDefenitions.push({
    context: {
      'device.DeviceOsType': 'Ios',
      'device.PartnerBrandId': 'testPartner',
      'device.DeviceType': 'Desktop'
    },
    keysToTest: [
      { keyName: '@tweek_clients_tests/test_category/test_key1', expectedValue: 'ios value' },
      { keyName: '@tweek_clients_tests/test_category/test_key2', expectedValue: true },
      { keyName: '@tweek_clients_tests/test_category2/user_fruit', expectedValue: 'orange' },
    ]
  })

  testDefenitions.forEach(test =>
    it('should succeed get keys values', async () => {
      // Arrange
      await initTweekRepository(test.context);

      test.keysToTest.forEach(x => _tweekRepo.prepare(x.keyName));
      const getKeysValuesPromises: Promise<any>[] = [];

      // Act
      await _tweekRepo.refresh();

      // Assert
      test.keysToTest.forEach(x => {
        getKeysValuesPromises.push(_tweekRepo.get(x.keyName));
      });

      Promise.all(getKeysValuesPromises).then(values =>
        values.reduce((pre, cur, index) => pre.push({
          actual: cur,
          expected: test.keysToTest[index].expectedValue
        }), []))
        .then(keysValues =>
          keysValues.forEach(x => expect(x.actual).to.eql(x.expected, 'should got the currect key value')));
    }));
});
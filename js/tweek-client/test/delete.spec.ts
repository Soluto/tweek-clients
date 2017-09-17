import 'mocha';
import sinon = require('sinon');
import chai = require('chai');
import sinonChai = require('sinon-chai');
import chaiAsProised = require('chai-as-promised');
import { FetchConfig } from '../index';
chai.use(sinonChai);
chai.use(chaiAsProised);
let { expect } = chai;

import { TweekClient } from '../index';

describe('tweek rest deleteContext', () => {
  const defaultUrl = 'http://test';
  let prepare = url => {
    const fetchStub = sinon.stub();

    const tweekClient = new TweekClient({
      baseServiceUrl: url || defaultUrl,
      casing: 'snake',
      convertTyping: false,
      fetch: fetchStub,
    });

    return {
      tweekClient,
      fetchStub,
    };
  };

  const testsDefenitions: {
    identityType: string;
    identityId: string;
    property: string;
    expectedUrl: string;
    expectedSuccess: boolean;
    baseUrl?: string;
  }[] = [];

  testsDefenitions.push({
    identityId: 'abcd1234',
    identityType: 'user',
    property: 'name',
    expectedUrl: `${defaultUrl}/api/v1/context/user/abcd1234/name`,
    expectedSuccess: true,
  });

  testsDefenitions.push({
    identityId: 'a1b2c3d4',
    identityType: 'device',
    property: 'osType',
    expectedUrl: `${defaultUrl}/api/v1/context/device/a1b2c3d4/osType`,
    expectedSuccess: false,
  });

  testsDefenitions.forEach(test => {
    it('should execute deleteContext correctly', async () => {
      // Arrange
      const { tweekClient, fetchStub } = prepare(test.baseUrl);
      if (test.expectedSuccess) {
        fetchStub.resolves(new Response());
      } else {
        fetchStub.rejects('Error!');
      }
      const expectedCallArgs = [test.expectedUrl, { method: 'DELETE' }];

      // Act
      let testPromise = tweekClient.deleteContext(test.identityType, test.identityId, test.property);

      // Assert
      expect(fetchStub).to.have.been.calledOnce;
      expect(fetchStub).to.have.been.calledWith(...expectedCallArgs);
      if (!test.expectedSuccess) {
        expect(testPromise).to.be.rejectedWith(Error, 'Error!');
      } else {
        expect(testPromise).to.be.fulfilled;
      }
    });
  });
});

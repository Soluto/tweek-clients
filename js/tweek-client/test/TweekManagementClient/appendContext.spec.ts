import sinon from 'sinon';
import { expect } from 'chai';
import { TweekManagementClient } from '../../src';

describe('tweek-client appendContext', () => {
  const defaultUrl = 'http://test';
  let prepare = (url?: string) => {
    const fetchStub = sinon.stub();

    const tweekClient = new TweekManagementClient({
      baseServiceUrl: url || defaultUrl,
      fetch: fetchStub,
    });

    return {
      tweekClient,
      fetchStub,
    };
  };

  const testsDefinitions: {
    identityType: string;
    identityId: string;
    expectedUrl: string;
    expectedSuccess: boolean;
    baseUrl?: string;
    context: object;
  }[] = [];

  testsDefinitions.push({
    identityId: 'abcd1234',
    identityType: 'user',
    expectedUrl: `${defaultUrl}/api/v2/context/user/abcd1234`,
    expectedSuccess: true,
    context: {
      name: 'SomeName',
      lastName: 'SomeLastName',
      age: 42,
    },
  });

  testsDefinitions.push({
    identityId: 'a1b2c3d4',
    identityType: 'device',
    expectedUrl: `${defaultUrl}/api/v2/context/device/a1b2c3d4`,
    expectedSuccess: false,
    context: {
      osType: 'Android',
      osVersion: '6.0',
      batteryPercentage: 99.1,
    },
  });

  testsDefinitions.forEach(test => {
    it('should execute appendContext correctly', async () => {
      // Arrange
      const { tweekClient, fetchStub } = prepare(test.baseUrl);
      const error = new Error('Error!');
      if (test.expectedSuccess) {
        fetchStub.resolves(new Response());
      } else {
        fetchStub.rejects(error);
      }
      const expectedCallArgs = [
        test.expectedUrl,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(test.context) },
      ];

      // Act
      let testPromise = tweekClient.appendContext(test.identityType, test.identityId, test.context);

      // Assert
      sinon.assert.calledOnce(fetchStub);
      sinon.assert.calledWithExactly(fetchStub, ...expectedCallArgs);
      if (!test.expectedSuccess) {
        await expect(testPromise).to.be.rejectedWith(error);
      } else {
        await expect(testPromise).to.be.fulfilled;
      }
    });
  });
});

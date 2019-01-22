import sinon from 'sinon';
import { expect } from 'chai';
import { TweekManagementClient } from '../../src';

describe('tweek-client deleteContext', () => {
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
    expectedUrl: `${defaultUrl}/api/v2/context/user/abcd1234/name`,
    expectedSuccess: true,
  });

  testsDefenitions.push({
    identityId: 'a1b2c3d4',
    identityType: 'device',
    property: 'osType',
    expectedUrl: `${defaultUrl}/api/v2/context/device/a1b2c3d4/osType`,
    expectedSuccess: false,
  });

  testsDefenitions.forEach(test => {
    it('should execute deleteContext correctly', async () => {
      // Arrange
      const { tweekClient, fetchStub } = prepare(test.baseUrl);
      const error = new Error('Error!');
      if (test.expectedSuccess) {
        fetchStub.resolves(new Response());
      } else {
        fetchStub.rejects(error);
      }
      const expectedCallArgs = [test.expectedUrl, { method: 'DELETE' }];

      // Act
      let testPromise = tweekClient.deleteContext(test.identityType, test.identityId, test.property);

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

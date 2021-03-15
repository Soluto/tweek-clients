import sinon from 'sinon';
import { expect } from 'chai';
import { TweekClientWithFallback } from '../src';

function createStub(shouldFail: boolean) {
  const stub = sinon.stub();
  if (shouldFail) {
    stub.rejects();
  } else {
    stub.resolves();
  }
  return stub;
}

function createMockClient(shouldFail = false) {
  return {
    getValues: createStub(shouldFail),
    fetch: createStub(shouldFail),
  };
}

describe('TweekClientWithFallback', () => {
  const path = 'somePath';
  const config = {};

  describe('getValues', () => {
    function assertCalled(client: any) {
      sinon.assert.calledOnce(client.getValues);
      sinon.assert.calledWithExactly(client.getValues, path, config);
    }

    function assertNotCalled(client: any) {
      sinon.assert.notCalled(client.getValues);
    }

    it('should fail if no clients are passed', async () => {
      const tweekClient = new TweekClientWithFallback([]);

      await expect(tweekClient.getValues(path, config)).to.be.rejected;
    });

    it('should stop calling clients after client succeeds', async () => {
      const clients = [createMockClient(), createMockClient(true), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await tweekClient.getValues(path, config);

      assertCalled(clients[0]);
      assertNotCalled(clients[1]);
      assertNotCalled(clients[2]);
    });

    it('should stop calling clients after client succeeds', async () => {
      const clients = [createMockClient(true), createMockClient(), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await tweekClient.getValues(path, config);

      assertCalled(clients[0]);
      assertCalled(clients[1]);
      assertNotCalled(clients[2]);
    });

    it('should fail if all clients fail', async () => {
      const clients = [createMockClient(true), createMockClient(true), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await expect(tweekClient.getValues(path, config)).to.be.rejected;

      assertCalled(clients[0]);
      assertCalled(clients[1]);
      assertCalled(clients[2]);
    });
  });
});

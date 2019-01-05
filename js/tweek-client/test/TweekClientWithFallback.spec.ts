import sinon from 'sinon';
import { expect } from 'chai';
import TweekClientWithFallback from '../src/TweekClientWithFallback';

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
    appendContext: createStub(shouldFail),
    deleteContext: createStub(shouldFail),
    fetch: createStub(shouldFail),
  };
}

describe('TweekClientWithFallback', () => {
  describe('appendContext', () => {
    const identityType = 'someIdentityType';
    const identityId = 'someIdentityId';
    const context = { a: 'a', b: 'b' };

    function assertCalled(client: any) {
      sinon.assert.calledOnce(client.appendContext);
      sinon.assert.calledWithExactly(client.appendContext, identityType, identityId, context);
    }

    function assertNotCalled(client: any) {
      sinon.assert.notCalled(client.appendContext);
    }

    it('should fail if no clients are passed', async () => {
      const tweekClient = new TweekClientWithFallback([]);

      await expect(tweekClient.appendContext(identityType, identityId, context)).to.be.rejected;
    });

    it('should stop calling clients after client succeeds', async () => {
      const clients = [createMockClient(), createMockClient(true), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await tweekClient.appendContext(identityType, identityId, context);

      assertCalled(clients[0]);
      assertNotCalled(clients[1]);
      assertNotCalled(clients[2]);
    });

    it('should stop calling clients after client succeeds', async () => {
      const clients = [createMockClient(true), createMockClient(), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await tweekClient.appendContext(identityType, identityId, context);

      assertCalled(clients[0]);
      assertCalled(clients[1]);
      assertNotCalled(clients[2]);
    });

    it('should fail if all clients fail', async () => {
      const clients = [createMockClient(true), createMockClient(true), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await expect(tweekClient.appendContext(identityType, identityId, context)).to.be.rejected;

      assertCalled(clients[0]);
      assertCalled(clients[1]);
      assertCalled(clients[2]);
    });
  });

  describe('deleteContext', () => {
    const identityType = 'someIdentityType';
    const identityId = 'someIdentityId';
    const property = 'someProperty';

    function assertCalled(client: any) {
      sinon.assert.calledOnce(client.deleteContext);
      sinon.assert.calledWithExactly(client.deleteContext, identityType, identityId, property);
    }

    function assertNotCalled(client: any) {
      sinon.assert.notCalled(client.deleteContext);
    }

    it('should fail if no clients are passed', async () => {
      const tweekClient = new TweekClientWithFallback([]);

      await expect(tweekClient.deleteContext(identityType, identityId, property)).to.be.rejected;
    });

    it('should stop calling clients after client succeeds', async () => {
      const clients = [createMockClient(), createMockClient(true), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await tweekClient.deleteContext(identityType, identityId, property);

      assertCalled(clients[0]);
      assertNotCalled(clients[1]);
      assertNotCalled(clients[2]);
    });

    it('should stop calling clients after client succeeds', async () => {
      const clients = [createMockClient(true), createMockClient(), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await tweekClient.deleteContext(identityType, identityId, property);

      assertCalled(clients[0]);
      assertCalled(clients[1]);
      assertNotCalled(clients[2]);
    });

    it('should fail if all clients fail', async () => {
      const clients = [createMockClient(true), createMockClient(true), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await expect(tweekClient.deleteContext(identityType, identityId, property)).to.be.rejected;

      assertCalled(clients[0]);
      assertCalled(clients[1]);
      assertCalled(clients[2]);
    });
  });

  describe('fetch', () => {
    const path = 'somePath';
    const config = {};

    function assertCalled(client: any) {
      sinon.assert.calledOnce(client.fetch);
      sinon.assert.calledWithExactly(client.fetch, path, config);
    }

    function assertNotCalled(client: any) {
      sinon.assert.notCalled(client.deleteContext);
    }

    it('should fail if no clients are passed', async () => {
      const tweekClient = new TweekClientWithFallback([]);

      await expect(tweekClient.fetch(path, config)).to.be.rejected;
    });

    it('should stop calling clients after client succeeds', async () => {
      const clients = [createMockClient(), createMockClient(true), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await tweekClient.fetch(path, config);

      assertCalled(clients[0]);
      assertNotCalled(clients[1]);
      assertNotCalled(clients[2]);
    });

    it('should stop calling clients after client succeeds', async () => {
      const clients = [createMockClient(true), createMockClient(), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await tweekClient.fetch(path, config);

      assertCalled(clients[0]);
      assertCalled(clients[1]);
      assertNotCalled(clients[2]);
    });

    it('should fail if all clients fail', async () => {
      const clients = [createMockClient(true), createMockClient(true), createMockClient(true)];
      const tweekClient = new TweekClientWithFallback(clients as any);

      await expect(tweekClient.fetch(path, config)).to.be.rejected;

      assertCalled(clients[0]);
      assertCalled(clients[1]);
      assertCalled(clients[2]);
    });
  });
});

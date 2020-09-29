import sinon from 'sinon';
import { FetchError, ITweekManagementClient, TweekManagementClient } from '../src';
import { expect } from 'chai';

type TestCase = {
  method: keyof ITweekManagementClient;
  args?: any[];
  expectedUrl: string;
  expectedRequestInit?: RequestInit;
  response?: any;
  transformedResult?: any;
};

describe('TweekManagementClient', () => {
  const baseServiceUrl = 'http://test';
  let fetchStub: sinon.SinonStub;
  let tweekClient: TweekManagementClient;

  beforeEach(() => {
    fetchStub = sinon.stub();
    tweekClient = new TweekManagementClient({
      baseServiceUrl,
      fetch: fetchStub,
    });
  });

  const runTest = ({ method, args = [], expectedUrl, expectedRequestInit, response, transformedResult }: TestCase) => {
    const expectedFetchArgs = [baseServiceUrl + expectedUrl, expectedRequestInit];

    it(`should execute ${String(method)} correctly`, async () => {
      fetchStub.resolves(new Response(response && JSON.stringify(response)));

      const result = await (tweekClient[method] as any)(...args);

      sinon.assert.calledOnce(fetchStub);
      sinon.assert.calledWithExactly(fetchStub, ...expectedFetchArgs);
      expect(result).to.deep.equal(transformedResult || response);
    });

    it('should throw error if fetch return bad status code', async () => {
      // Arrange
      fetchStub.resolves(new Response(null, { status: 500 }));

      // Act + Assert
      await expect((tweekClient[method] as any)(...args)).to.be.rejectedWith(FetchError);
      sinon.assert.calledOnce(fetchStub);
      sinon.assert.calledWithExactly(fetchStub, ...expectedFetchArgs);
    });
  };

  describe('getAllKeyManifests', () => {
    runTest({
      method: 'getAllKeyManifests',
      expectedUrl: '/api/v2/manifests',
      response: ['a', 'b', 'c'],
    });
  });
  describe('getKeyManifest', () => {
    runTest({
      method: 'getKeyManifest',
      args: ['some/key_path'],
      expectedUrl: '/api/v2/manifests/some/key_path',
      response: { a: 'b' },
    });
  });
  describe('getKeyDependents', () => {
    runTest({
      method: 'getKeyDependents',
      args: ['some/key_path'],
      expectedUrl: '/api/v2/dependents/some/key_path',
      response: ['a', 'b', 'c'],
    });
  });
  describe('getKeyDefinition', () => {
    runTest({
      method: 'getKeyDefinition',
      args: ['some/key_path'],
      expectedUrl: '/api/v2/keys/some/key_path',
      response: { a: 'b' },
    });

    runTest({
      method: 'getKeyDefinition',
      args: ['other/_', 'somerevision'],
      expectedUrl: '/api/v2/keys/other/_?revision=somerevision',
      response: { c: 'd' },
    });
  });
  describe('saveKeyDefinition', () => {
    runTest({
      method: 'saveKeyDefinition',
      args: ['some/key_path', { a: 'a' }],
      expectedUrl: '/api/v2/keys/some/key_path',
      expectedRequestInit: {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 'a' }),
      },
    });
  });
  describe('deleteKey', () => {
    runTest({
      method: 'deleteKey',
      args: ['some/key_path'],
      expectedUrl: '/api/v2/keys/some/key_path',
      expectedRequestInit: { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: '[]' },
    });

    runTest({
      method: 'deleteKey',
      args: ['some/other_path', ['a', 'b', 'c/d']],
      expectedUrl: '/api/v2/keys/some/other_path',
      expectedRequestInit: {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(['a', 'b', 'c/d']),
      },
    });
  });
  describe('getKeyRevisionHistory', () => {
    runTest({
      method: 'getKeyRevisionHistory',
      args: ['some/key_path'],
      expectedUrl: '/api/v2/revision-history/some/key_path?since=1%20month%20ago',
      response: ['a', 'b', 'c'],
    });

    runTest({
      method: 'getKeyRevisionHistory',
      args: ['some/key_path', 'someothertime'],
      expectedUrl: '/api/v2/revision-history/some/key_path?since=someothertime',
      response: ['a', 'b', 'c'],
    });
  });

  describe('getAllTags', () => {
    runTest({
      method: 'getAllTags',
      expectedUrl: '/api/v2/tags',
      response: ['a', 'b', 'c'],
    });
  });
  describe('appendTags', () => {
    runTest({
      method: 'appendTags',
      args: [['a', 'b', 'c']],
      expectedUrl: '/api/v2/tags',
      expectedRequestInit: {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(['a', 'b', 'c']),
      },
    });
  });

  describe('getSuggestions', () => {
    runTest({
      method: 'getSuggestions',
      args: ['a/b'],
      expectedUrl: '/api/v2/suggestions?count=25&q=a%2Fb',
      response: ['a', 'b'],
    });

    runTest({
      method: 'getSuggestions',
      args: ['c/d', 50],
      expectedUrl: '/api/v2/suggestions?count=50&q=c%2Fd',
      response: ['c', 'd'],
    });
  });
  describe('search', () => {
    runTest({
      method: 'search',
      args: ['a/b'],
      expectedUrl: '/api/v2/search?count=25&q=a%2Fb&type=field',
      response: ['a', 'b'],
    });

    runTest({
      method: 'search',
      args: ['c/d', 50],
      expectedUrl: '/api/v2/search?count=50&q=c%2Fd&type=field',
      response: ['c', 'd'],
    });
  });

  describe('getContext', () => {
    runTest({
      method: 'getContext',
      args: ['pet', 'fish'],
      expectedUrl: '/api/v2/context/pet/fish',
      response: { swims: true },
    });
  });
  describe('appendContext', () => {
    runTest({
      method: 'appendContext',
      args: ['device', 'a1b2c3d4', { osType: 'Android', osVersion: '6.0', batteryPercentage: 99.1 }],
      expectedUrl: '/api/v2/context/device/a1b2c3d4',
      expectedRequestInit: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ osType: 'Android', osVersion: '6.0', batteryPercentage: 99.1 }),
      },
    });
  });
  describe('deleteContextProperty', () => {
    runTest({
      method: 'deleteContextProperty',
      args: ['user', 'abcd1234', 'name'],
      expectedUrl: '/api/v2/context/user/abcd1234/name',
      expectedRequestInit: { method: 'DELETE' },
    });
  });
  describe('deleteContext', () => {
    runTest({
      method: 'deleteContext',
      args: ['user', 'abcd1234'],
      expectedUrl: '/api/v2/context/user/abcd1234',
      expectedRequestInit: { method: 'DELETE' },
    });
  });

  describe('getAllSchemas', () => {
    runTest({
      method: 'getAllSchemas',
      expectedUrl: '/api/v2/schemas',
      response: ['a', 'b', 'c'],
    });
  });
  describe('deleteIdentity', () => {
    runTest({
      method: 'deleteIdentity',
      args: ['device'],
      expectedUrl: '/api/v2/schemas/device',
      expectedRequestInit: { method: 'DELETE' },
    });
  });
  describe('saveIdentity', () => {
    runTest({
      method: 'saveIdentity',
      args: ['device', { a: 'a', b: 'c' }],
      expectedUrl: '/api/v2/schemas/device',
      expectedRequestInit: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 'a', b: 'c' }),
      },
    });
  });
  describe('patchIdentity', () => {
    runTest({
      method: 'patchIdentity',
      args: ['device', { a: 'a', b: 'c' }],
      expectedUrl: '/api/v2/schemas/device',
      expectedRequestInit: {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 'a', b: 'c' }),
      },
    });
  });

  describe('getPolicies', () => {
    runTest({
      method: 'getPolicies',
      expectedUrl: '/api/v2/policies',
      response: {
        policies: [
          {
            group: '*',
            user: '*',
            contexts: {},
            object: '*',
            action: '*',
            effect: 'allow',
          },
        ],
      },
      transformedResult: [
        {
          group: '*',
          user: '*',
          contexts: {},
          object: '*',
          action: '*',
          effect: 'allow',
        },
      ],
    });
  });
  describe('savePolicies', () => {
    runTest({
      method: 'savePolicies',
      args: [[{ a: 'a' }]],
      expectedUrl: '/api/v2/policies',
      expectedRequestInit: {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policies: [{ a: 'a' }] }),
      },
    });
  });
  describe('patchPolicies', () => {
    runTest({
      method: 'patchPolicies',
      args: [{ a: 'a', b: 'c' }],
      expectedUrl: '/api/v2/policies',
      expectedRequestInit: {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 'a', b: 'c' }),
      },
    });
  });

  describe('getJWTExtractionPolicy', () => {
    runTest({
      method: 'getJWTExtractionPolicy',
      expectedUrl: '/api/v2/jwt-extraction-policy',
      response: { data: 'somerego' },
      transformedResult: 'somerego',
    });
  });

  describe('saveJWTExtractionPolicy', () => {
    runTest({
      method: 'saveJWTExtractionPolicy',
      args: ['somerego'],
      expectedUrl: '/api/v2/jwt-extraction-policy',
      expectedRequestInit: {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'somerego' }),
      },
    });
  });

  describe('currentUser', () => {
    runTest({
      method: 'currentUser',
      args: [],
      expectedUrl: '/api/v2/current-user',
      response: { a: 'a', b: 'b' },
    });
  });
  describe('getAuthProviders', () => {
    runTest({
      method: 'getAuthProviders',
      args: [],
      expectedUrl: '/auth/providers',
      response: ['a', 'b', 'c'],
    });
  });
  describe('getServiceDetails', () => {
    runTest({
      method: 'getServiceDetails',
      args: [],
      expectedUrl: '/version',
      response: { a: 'b', c: 'd' },
    });
  });

  describe('getHooks', () => {
    runTest({
      method: 'getHooks',
      expectedUrl: '/api/v2/hooks',
      response: [{ id: 'id1', keyPath: 'a/b/c', type: 'notification_webhook', url: 'a url' }],
    });
  });

  describe('getHooks with keyPathFilter', () => {
    runTest({
      method: 'getHooks',
      args: ['a/b/c'],
      expectedUrl: `/api/v2/hooks/?keyPathFilter=${encodeURIComponent('a/b/c')}`,
      response: [{ id: 'id1', keyPath: 'a/b/c', type: 'notification_webhook', url: 'a url' }],
    });
  });

  describe('createHook', () => {
    const hookData = { keyPath: 'a/b/c', type: 'notification_webhook', url: 'a url' };

    runTest({
      method: 'createHook',
      args: [hookData],
      expectedUrl: '/api/v2/hooks',
      expectedRequestInit: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hookData),
      },
      response: [{ id: 'id1', ...hookData }],
    });
  });

  describe('updateHook', () => {
    const hookData = { keyPath: 'a/b/c', type: 'notification_webhook', url: 'a url' };

    runTest({
      method: 'updateHook',
      args: [{ id: 'id1', ...hookData }],
      expectedUrl: '/api/v2/hooks/id1',
      expectedRequestInit: {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hookData),
      },
    });
  });

  describe('deleteHook', () => {
    runTest({
      method: 'deleteHook',
      args: [{ id: 'id1' }],
      expectedUrl: '/api/v2/hooks/id1',
      expectedRequestInit: { method: 'DELETE' },
    });
  });

  describe('getExternalApps', () => {
    runTest({
      method: 'getExternalApps',
      expectedUrl: '/api/v2/apps',
      response: [],
    });
  });

  describe('createExternalApp', () => {
    const appData = { name: 'test-app' };

    runTest({
      method: 'createExternalApp',
      args: [appData],
      expectedUrl: '/api/v2/apps',
      expectedRequestInit: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData),
      },
      response: [{ appId: 'id1', secret: 'SECRET' }],
    });
  });

  describe('getExternalApp', () => {
    runTest({
      method: 'getExternalApp',
      args: ['appId1'],
      expectedUrl: '/api/v2/apps/appId1',
      response: [],
    });
  });

  describe('updateExternalApp', () => {
    const appData = { name: 'test-app-new' };

    runTest({
      method: 'updateExternalApp',
      args: ['appId1', appData],
      expectedUrl: '/api/v2/apps/appId1',
      expectedRequestInit: {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData),
      },
    });
  });

  describe('deleteExternalApp', () => {
    runTest({
      method: 'deleteExternalApp',
      args: ['appId1'],
      expectedUrl: '/api/v2/apps/appId1',
      expectedRequestInit: { method: 'DELETE' },
    });
  });

  describe('createExternalAppSecretKey', () => {
    runTest({
      method: 'createExternalAppSecretKey',
      args: ['appId1'],
      expectedUrl: '/api/v2/apps/appId1/keys',
      expectedRequestInit: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      response: [{ keyId: 'keyId1', secret: 'SECRET' }],
    });
  });

  describe('deleteExternalAppSecretKey', () => {
    runTest({
      method: 'deleteExternalAppSecretKey',
      args: ['appId1', 'keyId1'],
      expectedUrl: '/api/v2/apps/appId1/keys/keyId1',
      expectedRequestInit: { method: 'DELETE' },
    });
  });
});

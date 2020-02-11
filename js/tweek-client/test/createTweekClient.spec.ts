import fetchMock, { MockResponseObject } from 'fetch-mock';
import sinon from 'sinon';
import { expect } from 'chai';
import { createTweekClient } from '../src';

describe('createTweekClient', () => {
  const baseServiceUrl = 'http://test/';
  const matcherName = 'create-tweek-client';
  const token = 'expected_token';
  const url = 'expected_url';
  const expectedOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  beforeEach(() => {
    fetchMock.getOnce(
      '*',
      { data: {} },
      {
        name: matcherName,
      },
    );
  });

  afterEach(fetchMock.restore);

  describe('authentication', () => {
    it('authentication token should be passed to fetch request', async () => {
      // Arrange
      const getAuthenticationToken = () => token;
      const tweekClient = createTweekClient({
        baseServiceUrl,
        getAuthenticationToken,
        fetch: fetch,
      });

      // Act
      await tweekClient.getValues(url);

      // Assert
      expect(fetchMock.lastOptions(matcherName)).to.deep.equal(expectedOptions);
    });

    it('authentication token promise should be passed to fetch request', async () => {
      // Arrange
      const getAuthenticationToken = () => Promise.resolve(token);
      const tweekClient = createTweekClient({
        baseServiceUrl,
        getAuthenticationToken,
        fetch: fetch,
      });

      // Act
      await tweekClient.getValues(url);

      // Assert
      expect(fetchMock.lastOptions(matcherName)).to.deep.equal(expectedOptions);
    });

    it('should not fail if getAuthenticationToken is not passed', () => {
      // Arrange
      const tweekClient = createTweekClient({
        baseServiceUrl,
        fetch: fetch,
      });

      const testPromise = tweekClient.getValues(url);

      return expect(testPromise).to.be.fulfilled;
    });
  });

  it('should add client credentials to request', async () => {
    const tweekClient = createTweekClient({
      baseServiceUrl,
      fetch: fetch,
      clientId: 'test-id',
      clientSecret: 'test-secret',
    });

    await tweekClient.getValues(url);

    expect(fetchMock.lastOptions(matcherName)).to.deep.include({
      headers: { 'X-Client-Id': 'test-id', 'X-Client-Secret': 'test-secret' },
    });
  });

  it('should return arrays correctly', async () => {
    const expectedResult = [1, 2, 3];
    fetchMock.restore();
    fetchMock.getOnce('*', expectedResult, { name: matcherName });

    const tweekClient = createTweekClient({
      baseServiceUrl,
      fetch: fetch,
    });

    const response = await tweekClient.getValues(url);
    expect(response).to.deep.equal(expectedResult);
  });

  it('should call onError if fetch returned an error', async () => {
    const onError = sinon.stub();
    const response: MockResponseObject = {
      body: 'response text',
      status: 500,
    };

    fetchMock.restore();
    fetchMock.getOnce('*', response, { name: matcherName });

    const tweekClient = createTweekClient({
      baseServiceUrl,
      fetch,
      onError,
    });

    await expect(tweekClient.getValues(url)).to.be.rejected;
    await new Promise(res => setImmediate(res));
    sinon.assert.calledOnce(onError);

    const actualError = onError.args[0][0];

    expect(actualError.status).to.eq(500);
    expect(actualError.url).to.eq('http://test/api/v2/values/expected_url');
    expect(actualError.responseText).to.eq('response text');
  });

  it('should call onError if fetch throws error', async () => {
    const onError = sinon.stub();
    const expectedError = new Error('error error');
    const response: MockResponseObject = {
      throws: expectedError,
    };

    fetchMock.restore();
    fetchMock.getOnce('*', response, { name: matcherName });

    const tweekClient = createTweekClient({
      baseServiceUrl,
      fetch,
      onError,
    });

    await expect(tweekClient.getValues(url)).to.be.rejected;
    await new Promise(res => setImmediate(res));

    sinon.assert.calledOnce(onError);
    sinon.assert.calledWithExactly(onError, expectedError);
  });
});

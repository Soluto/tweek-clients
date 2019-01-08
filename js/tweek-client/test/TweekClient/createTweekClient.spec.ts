import fetchMock from 'fetch-mock';
import { expect } from 'chai';
import createTweekClient from '../../src/createTweekClient';

describe('create tweek client', () => {
  const baseServiceUrl = 'http://test/';
  const matcherName = 'create-tweek-client';
  const token = 'expected_token';
  const url = 'expected_url';
  const expectedOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Api-Client': 'unknown',
    },
  };

  beforeEach(() => {
    fetchMock.getOnce(
      '*',
      {},
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
      await tweekClient.fetch(url);

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
      await tweekClient.fetch(url);

      // Assert
      expect(fetchMock.lastOptions(matcherName)).to.deep.equal(expectedOptions);
    });

    it('should not fail if getAuthenticationToken is not passed', () => {
      // Arrange
      const tweekClient = createTweekClient({
        baseServiceUrl,
        fetch: fetch,
      });

      const testPromise = tweekClient.fetch(url);

      return expect(testPromise).to.be.fulfilled;
    });
  });

  it('should allow replacing x-client-api header', async () => {
    const tweekClient = createTweekClient({
      baseServiceUrl,
      fetch: fetch,
      clientName: 'test',
    });

    await tweekClient.fetch(url);

    expect(fetchMock.lastOptions(matcherName)).to.deep.include({ headers: { 'X-Api-Client': 'test' } });
  });

  it('should return arrays correctly', async () => {
    const expectedResult = [1, 2, 3];
    fetchMock.restore();
    fetchMock.getOnce('*', expectedResult, {
      name: matcherName,
    });

    const tweekClient = createTweekClient({
      baseServiceUrl,
      fetch: fetch,
    });

    const response = await tweekClient.fetch(url);
    expect(response).to.deep.equal(expectedResult);
  });
});

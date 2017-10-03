import 'mocha';
import 'isomorphic-fetch';
import chai = require('chai');
import chaiAsProised = require('chai-as-promised');
import fetchMock = require('fetch-mock');
import createTweekClient from '../../src/createTweekClient';

chai.use(chaiAsProised);
let { expect } = chai;

describe('tweek-client authentication', () => {
  const baseServiceUrl = 'http://test/';
  const matcherName = 'authentication';
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
      {},
      {
        name: matcherName,
      },
    );
  });

  it('authentication token should be passed to fetch request', async () => {
    // Arrange
    const getAuthenticationToken = () => token;
    const tweekClient = createTweekClient({
      baseServiceUrl,
      getAuthenticationToken,
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
    });

    const testPromise = tweekClient.fetch(url);

    return expect(testPromise).to.be.fulfilled;
  });
});

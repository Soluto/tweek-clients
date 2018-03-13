import sinon = require('sinon');
import { expect } from 'chai';
import { FetchConfig } from '../../src/index';
import TweekClient from '../../src/TweekClient';

describe('tweek-client fetchChunks', () => {
  type TestConfiguration = {
    pathToFetch: string;
    expectedUrl: string;
    expectedQueryParams?: string;
    resultsToResolve: Response[];
    config: FetchConfig;
    expectedResult?: Object;
    baseUrl?: string;
    context?: object;
  };

  const maxChuckSize = 3;
  const defaultUrl = 'http://test/';

  const prepare = url => {
    const fetchStub = sinon.stub();

    const tweekClient = new TweekClient({
      baseServiceUrl: url || defaultUrl,
      casing: 'snake',
      convertTyping: false,
      fetch: fetchStub,
    });

    const test: TestConfiguration = {
      pathToFetch: '_',
      expectedUrl: `${defaultUrl}api/v1/keys/_`,
      resultsToResolve: [
        new Response('{ "a1": 1, "a2": 2, "a3": 3 }'),
        new Response('{ "b1": "a", "b2": "b", "b3": "c" }'),
        new Response('{ "c5": true }'),
      ],
      config: {
        include: ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c5'],
      },
      expectedResult: {
        a1: 1,
        a2: 2,
        a3: 3,
        b1: 'a',
        b2: 'b',
        b3: 'c',
        c5: true,
      },
    };

    return {
      tweekClient,
      fetchStub,
      test,
    };
  };

  it('should execute fetchChunks correctly', async () => {
    // Arrange
    const { tweekClient, fetchStub, test } = prepare(defaultUrl);
    test.resultsToResolve.forEach((resToResolve, i) => {
      fetchStub.onCall(i).resolves(resToResolve);
    });

    // Act
    const result = await tweekClient.fetchChunks(test.pathToFetch, test.config, maxChuckSize);

    // Assert
    expect(fetchStub).to.have.been.calledThrice;
    expect(result).to.deep.equal(test.expectedResult);
  });
});

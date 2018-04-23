import sinon = require('sinon');
import { expect } from 'chai';
import { FetchConfig } from '../../src/index';
import TweekClient from '../../src/TweekClient';

describe('tweek-client fetchChunks', () => {
  type TestConfiguration = {
    pathToFetch: string;
    expectedUrl: string;
    expectedQueryParams?: string;
    stubCalls: { requestUrl: string; response: Response }[];
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
      stubCalls: [
        {
          requestUrl: 'http://test/api/v1/keys/_?%24include=a1&%24include=a2&%24include=a3',
          response: new Response('{ "a1": 1, "a2": 2, "a3": 3 }'),
        },
        {
          requestUrl: 'http://test/api/v1/keys/_?%24include=b1&%24include=b2&%24include=b3',
          response: new Response('{ "b1": "a", "b2": "b", "b3": "c" }'),
        },
        {
          requestUrl: 'http://test/api/v1/keys/_?%24include=c5',
          response: new Response('{ "c5": true }'),
        },
      ],
      config: {
        include: ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c5'],
        maxChunkSize: 3,
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
    test.stubCalls.forEach(stub => {
      fetchStub.withArgs(stub.requestUrl).resolves(stub.response);
    });

    // Act
    const result = await tweekClient.fetch(test.pathToFetch, test.config);

    // Assert
    expect(fetchStub).to.have.been.calledThrice;
    expect(result).to.deep.equal(test.expectedResult);
  });
});

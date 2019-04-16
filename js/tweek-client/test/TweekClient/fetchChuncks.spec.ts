import sinon from 'sinon';
import { expect } from 'chai';
import { GetValuesConfig, TweekClient } from '../../src';

describe('TweekClient fetchChunks', () => {
  type TestConfiguration = {
    pathToFetch: string;
    expectedUrl: string;
    expectedQueryParams?: string;
    stubCalls: { requestUrl: string; response: Response }[];
    config: GetValuesConfig;
    expectedResult?: Object;
    baseUrl?: string;
    context?: object;
  };

  const defaultUrl = 'http://test/';

  const prepare = (includeErrors: boolean) => {
    const fetchStub = sinon.stub();

    const tweekClient = new TweekClient({
      baseServiceUrl: defaultUrl,
      fetch: fetchStub,
    });

    const wrapIfNeeded = (data: any) => (includeErrors ? { data, errors: {} } : data);
    const createResponse = (data: any) => new Response(JSON.stringify(wrapIfNeeded(data)));
    const addQueryParamIfNeeded = (url: string) => (includeErrors ? `${url}&%24includeErrors=true` : url);

    const test: TestConfiguration = {
      pathToFetch: '_',
      expectedUrl: `${defaultUrl}api/v2/values/_`,
      stubCalls: [
        {
          requestUrl: addQueryParamIfNeeded('http://test/api/v2/values/_?%24include=a1&%24include=a2&%24include=a3'),
          response: createResponse({ a1: 1, a2: 2, a3: 3 }),
        },
        {
          requestUrl: addQueryParamIfNeeded('http://test/api/v2/values/_?%24include=b1&%24include=b2&%24include=b3'),
          response: createResponse({ b1: 'a', b2: 'b', b3: 'c' }),
        },
        {
          requestUrl: addQueryParamIfNeeded('http://test/api/v2/values/_?%24include=c5'),
          response: createResponse({ c5: true }),
        },
      ],
      config: {
        include: ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c5'],
        maxChunkSize: 3,
      },
      expectedResult: wrapIfNeeded({
        a1: 1,
        a2: 2,
        a3: 3,
        b1: 'a',
        b2: 'b',
        b3: 'c',
        c5: true,
      }),
    };

    return {
      tweekClient,
      fetchStub,
      test,
    };
  };

  it('getValues should execute fetchChunks correctly', async () => {
    // Arrange
    const { tweekClient, fetchStub, test } = prepare(false);
    test.stubCalls.forEach(stub => {
      fetchStub.withArgs(stub.requestUrl).resolves(stub.response);
    });

    // Act
    const result = await tweekClient.getValues(test.pathToFetch, test.config);

    // Assert
    sinon.assert.calledThrice(fetchStub);
    expect(result).to.deep.equal(test.expectedResult);
  });

  it('getValuesWithDetails should execute fetchChunks correctly', async () => {
    // Arrange
    const { tweekClient, fetchStub, test } = prepare(true);
    test.stubCalls.forEach(stub => {
      fetchStub.withArgs(stub.requestUrl).resolves(stub.response);
    });

    // Act
    const result = await tweekClient.getValuesWithDetails(test.pathToFetch, test.config);

    // Assert
    sinon.assert.calledThrice(fetchStub);
    expect(result).to.deep.equal(test.expectedResult);
  });
});

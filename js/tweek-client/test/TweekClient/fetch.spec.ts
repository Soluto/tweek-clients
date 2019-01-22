import sinon from 'sinon';
import { expect } from 'chai';
import { GetValuesConfig } from '../../src';
import TweekClient from '../../src/TweekClient';

const ENCODE_$_CHARACTER = encodeURIComponent('$');
const ENCODE_SLASH_CHARACTER = encodeURIComponent('/');

const queryParamsEncoder = (queryParams: string) =>
  queryParams.replace(/\$/g, ENCODE_$_CHARACTER).replace(/\//g, ENCODE_SLASH_CHARACTER);

describe('tweek-client fetch', () => {
  const defaultUrl = 'http://test/';
  let prepare = (url?: string) => {
    const fetchStub = sinon.stub();

    const tweekClient = new TweekClient({
      baseServiceUrl: url || defaultUrl,
      fetch: fetchStub,
    });

    return {
      tweekClient,
      fetchStub,
    };
  };

  const testsDefenitions: {
    pathToFetch: string;
    expectedUrl: string;
    expectedQueryParams?: string;
    resultsToResolve?: Object;
    config?: GetValuesConfig;
    expectedResult?: Object;
    baseUrl?: string;
    context?: object;
  }[] = [];

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$include=abc`,
    config: {
      include: ['abc'],
    },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$include=path1&$include=path2/key&$include=path3/_`,
    config: {
      include: ['path1', 'path2/key', 'path3/_'],
    },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?user=userid&user.gender=male`,
    config: {
      context: {
        user: {
          id: 'userid',
          gender: 'male',
        },
      },
    },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?user=userid`,
    config: {
      context: {
        user: 'userid',
      },
    },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    resultsToResolve: { some_path: { some_key: 'abc' } },
    expectedResult: { some_path: { some_key: 'abc' } },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true`,
    config: { flatten: true },
    resultsToResolve: { 'some_path/some_key': true },
    expectedResult: { 'some_path/some_key': true },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true`,
    config: { flatten: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': 'true' },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true`,
    config: { flatten: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': 'true' },
    baseUrl: defaultUrl.substr(0, defaultUrl.length - 1),
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true&$ignoreKeyTypes=true`,
    config: { flatten: true, ignoreKeyTypes: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': 'true' },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true`,
    config: { flatten: true, ignoreKeyTypes: false },
    resultsToResolve: { 'some_path/some_key': true },
    expectedResult: { 'some_path/some_key': true },
  });

  testsDefenitions.forEach(test =>
    it('should execute fetch correctly', async () => {
      // Arrange
      const { tweekClient, fetchStub } = prepare(test.baseUrl);
      fetchStub.resolves(new Response(JSON.stringify(test.resultsToResolve || {})));
      const expectedUrl = test.expectedUrl + queryParamsEncoder(test.expectedQueryParams || '');

      // Act
      const result = await tweekClient.getValues(test.pathToFetch, test.config);

      // Assert
      sinon.assert.calledOnce(fetchStub);
      sinon.assert.calledWithExactly(fetchStub, expectedUrl);
      if (test.expectedResult) {
        expect(result).to.eql(test.expectedResult, 'should return correct keys result');
      }
    }),
  );
});

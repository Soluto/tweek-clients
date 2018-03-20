import sinon = require('sinon');
import { expect } from 'chai';
import { FetchConfig } from '../../src/index';
import TweekClient from '../../src/TweekClient';

describe('tweek-client fetch', () => {
  const defaultUrl = 'http://test/';
  let prepare = url => {
    const fetchStub = sinon.stub();
    const onErrorStub = sinon.stub();

    const tweekClient = new TweekClient({
      baseServiceUrl: url || defaultUrl,
      casing: 'snake',
      convertTyping: false,
      fetch: fetchStub,
      onError: onErrorStub,
    });

    return {
      tweekClient,
      fetchStub,
      onErrorStub,
    };
  };

  const testsDefenitions: {
    pathToFetch: string;
    expectedUrl: string;
    expectedQueryParams?: string;
    resultsToResolve?: Object;
    config?: FetchConfig;
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
    config: { casing: 'camelCase' },
    resultsToResolve: { some_path: { some_key: 'abc' } },
    expectedResult: { somePath: { someKey: 'abc' } },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    config: { casing: 'snake' },
    resultsToResolve: { some_path: { some_key: 'abc' } },
    expectedResult: { some_path: { some_key: 'abc' } },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    config: { convertTyping: true },
    resultsToResolve: { some_path: { some_key: 'true' } },
    expectedResult: { some_path: { some_key: true } },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true`,
    config: { casing: 'camelCase', convertTyping: true, flatten: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': true },
  });

  testsDefenitions.push({
    pathToFetch: '/_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true`,
    config: { casing: 'camelCase', convertTyping: true, flatten: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': true },
  });

  testsDefenitions.push({
    pathToFetch: '/_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true`,
    config: { casing: 'camelCase', convertTyping: true, flatten: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': true },
    baseUrl: defaultUrl.substr(0, defaultUrl.length - 1),
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true`,
    config: { casing: 'camelCase', convertTyping: true, flatten: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': true },
    baseUrl: defaultUrl.substr(0, defaultUrl.length - 1),
  });

  testsDefenitions.push({
    pathToFetch: '/_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true&$ignoreKeyTypes=true`,
    config: { casing: 'camelCase', convertTyping: true, flatten: true, ignoreKeyTypes: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': true },
  });

  testsDefenitions.push({
    pathToFetch: '/_',
    expectedUrl: `${defaultUrl}api/v1/keys/_`,
    expectedQueryParams: `?$flatten=true`,
    config: { casing: 'camelCase', convertTyping: true, flatten: true, ignoreKeyTypes: false },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': true },
  });

  testsDefenitions.forEach(test =>
    it('should execute fetch correctly', async () => {
      // Arrange
      const { tweekClient, fetchStub, onErrorStub } = prepare(test.baseUrl);
      if (!!test.resultsToResolve) {
        fetchStub.resolves(new Response(JSON.stringify(test.resultsToResolve)));
      } else {
        fetchStub.resolves(new Response('{}'));
      }
      const expectedUrl = test.expectedUrl + tweekClient.queryParamsEncoder(test.expectedQueryParams || '');

      // Act
      const result = await tweekClient.fetch(test.pathToFetch, test.config);

      // Assert
      expect(fetchStub).to.have.been.calledOnce;
      expect(fetchStub).to.have.been.calledWithExactly(expectedUrl);
      expect(onErrorStub).to.not.have.been.called;
      if (!!test.expectedResult) expect(result).to.eql(test.expectedResult, 'should return corerct keys result');
    }),
  );

  it('should call onError if fetch returned an error', async () => {
    const { tweekClient, fetchStub, onErrorStub } = prepare(defaultUrl);
    const statusText = 'someStatusText';
    fetchStub.resolves(
      new Response(null, {
        status: 500,
        statusText,
      }),
    );
    const fetchPromise = tweekClient.fetch('/_');
    await expect(fetchPromise).to.be.rejectedWith(statusText);
    expect(onErrorStub).to.have.been.calledOnce;
  });
});

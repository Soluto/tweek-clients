import sinon from 'sinon';
import { expect } from 'chai';
import qs, { InputParams } from 'query-string';
import { GetValuesConfig, TweekClient } from '../../src';

export const toQueryString = (query: InputParams | undefined, includeErrors?: boolean) => {
  const queryString = qs.stringify({ $includeErrors: includeErrors, ...query });
  return queryString ? `?${queryString}` : '';
};

describe('TweekClient getValues', () => {
  const defaultUrl = 'http://test/';
  let prepare = (url?: string, useLegacyEndpoint?: boolean) => {
    const fetchStub = sinon.stub();

    const tweekClient = new TweekClient(
      {
        baseServiceUrl: url || defaultUrl,
        fetch: fetchStub,
      },
      useLegacyEndpoint,
    );

    return {
      tweekClient,
      fetchStub,
    };
  };

  const testsDefenitions: {
    pathToFetch: string;
    expectedQueryParams?: InputParams;
    resultsToResolve?: any;
    config?: GetValuesConfig;
    expectedResult?: any;
    baseUrl?: string;
    context?: object;
  }[] = [];

  testsDefenitions.push({
    pathToFetch: 'some_key',
    resultsToResolve: 'some value',
    expectedResult: 'some value',
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedQueryParams: { $include: 'abc' },
    config: {
      include: ['abc'],
    },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedQueryParams: { $include: ['path1', 'path2/key', 'path3/_'] },
    config: {
      include: ['path1', 'path2/key', 'path3/_'],
    },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedQueryParams: { user: 'userid', 'user.gender': 'male' },
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
    expectedQueryParams: { user: 'userid' },
    config: {
      context: {
        user: 'userid',
      },
    },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    resultsToResolve: { some_path: { some_key: 'abc' } },
    expectedResult: { some_path: { some_key: 'abc' } },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedQueryParams: { $flatten: true },
    config: { flatten: true },
    resultsToResolve: { 'some_path/some_key': true },
    expectedResult: { 'some_path/some_key': true },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedQueryParams: { $flatten: true },
    config: { flatten: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': 'true' },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedQueryParams: { $flatten: true },
    config: { flatten: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': 'true' },
    baseUrl: defaultUrl.substr(0, defaultUrl.length - 1),
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedQueryParams: { $flatten: true, $ignoreKeyTypes: true },
    config: { flatten: true, ignoreKeyTypes: true },
    resultsToResolve: { 'some_path/some_key': 'true' },
    expectedResult: { 'some_path/some_key': 'true' },
  });

  testsDefenitions.push({
    pathToFetch: '_',
    expectedQueryParams: { $flatten: true },
    config: { flatten: true, ignoreKeyTypes: false },
    resultsToResolve: { 'some_path/some_key': true },
    expectedResult: { 'some_path/some_key': true },
  });

  testsDefenitions.forEach(
    ({ baseUrl, pathToFetch, config, resultsToResolve = {}, expectedQueryParams, expectedResult }) =>
      it('should execute getValues correctly', async () => {
        // Arrange
        const { tweekClient, fetchStub } = prepare(baseUrl);
        fetchStub.resolves(new Response(JSON.stringify(resultsToResolve)));
        const expectedUrl = `${defaultUrl}api/v2/values/${pathToFetch}` + toQueryString(expectedQueryParams);

        // Act
        const result = await tweekClient.getValues(pathToFetch, config);

        // Assert
        sinon.assert.calledOnce(fetchStub);
        sinon.assert.calledWithExactly(fetchStub, expectedUrl);
        if (expectedResult) {
          expect(result).to.eql(expectedResult, 'should return correct keys result');
        }
      }),
  );

  it('should getValues correctly from legacy endpoint', async () => {
    // Arrange
    const { tweekClient, fetchStub } = prepare(defaultUrl, true);
    fetchStub.resolves(new Response('{}'));
    // Act
    await tweekClient.getValues('_');

    // Assert
    sinon.assert.calledOnce(fetchStub);
    sinon.assert.calledWithExactly(fetchStub, `${defaultUrl}api/v1/keys/_${toQueryString(undefined)}`);
  });
});

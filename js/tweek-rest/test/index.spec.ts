import 'mocha';
import sinon = require('sinon');
import chai = require('chai');
import sinonChai = require('sinon-chai');
import { FetchConfig } from '../index';
chai.use(sinonChai);
let {expect} = chai;

import { TweekClient } from '../index';

describe("tweek rest", () => {
    const defaultUrl = 'http://test/';
    let prepare = (url) => {
        const restGetterStub = sinon.stub();
        const restPosterStub = sinon.stub();

        const tweekClient = new TweekClient({
            baseServiceUrl: url || defaultUrl,
            casing: "snake",
            convertTyping: false,
            restGetter: restGetterStub,
            restPoster: restPosterStub
        });

        return {
            tweekClient,
            restGetterStub
        };
    };

    const testsDefenitions: {
        pathToFetch: string,
        expectedUrl: string,
        expectedQueryParams?: string,
        resultsToResolve?: Object
        config?: FetchConfig,
        expectedResult?: Object,
        baseUrl?: string
    }[] = [];

    testsDefenitions.push({
        pathToFetch: '_',
        expectedUrl: `${defaultUrl}_`,
        expectedQueryParams: `?$include=abc`,
        config: {
            include: ['abc']
        }
    });

    testsDefenitions.push({
        pathToFetch: '_',
        expectedUrl: `${defaultUrl}_`,
        expectedQueryParams: `?$include=path1&$include=path2/key&$include=path3/_`,
        config: {
            include: ['path1', 'path2/key', 'path3/_']
        }
    });

    testsDefenitions.push({
        pathToFetch: '_',
        expectedUrl: `${defaultUrl}_`,
        expectedQueryParams: `?user=userid&user.gender=male`,
        config: {
            context: {
                user: {
                    id: "userid",
                    gender: "male"
                }
            }
        }
    });

    testsDefenitions.push({
        pathToFetch: '_',
        expectedUrl: `${defaultUrl}_`,
        config: { casing: "camelCase" },
        resultsToResolve: { some_path: { some_key: "abc" } },
        expectedResult: { somePath: { someKey: "abc" } }
    });

    testsDefenitions.push({
        pathToFetch: '_',
        expectedUrl: `${defaultUrl}_`,
        config: { casing: "snake" },
        resultsToResolve: { some_path: { some_key: "abc" } },
        expectedResult: { some_path: { some_key: "abc" } }
    });

    testsDefenitions.push({
        pathToFetch: '_',
        expectedUrl: `${defaultUrl}_`,
        config: { convertTyping: true },
        resultsToResolve: { some_path: { some_key: "true" } },
        expectedResult: { some_path: { some_key: true } }
    });

    testsDefenitions.push({
        pathToFetch: '_',
        expectedUrl: `${defaultUrl}_`,
        expectedQueryParams: `?$flatten=true`,
        config: { casing: "camelCase", convertTyping: true, flatten: true },
        resultsToResolve: { "some_path/some_key": "true" },
        expectedResult: { "some_path/some_key": true }
    });

    testsDefenitions.push({
        pathToFetch: '/_',
        expectedUrl: `${defaultUrl}_`,
        expectedQueryParams: `?$flatten=true`,
        config: { casing: "camelCase", convertTyping: true, flatten: true },
        resultsToResolve: { "some_path/some_key": "true" },
        expectedResult: { "some_path/some_key": true }
    });

    testsDefenitions.push({
        pathToFetch: '/_',
        expectedUrl: `${defaultUrl}_`,
        expectedQueryParams: `?$flatten=true`,
        config: { casing: "camelCase", convertTyping: true, flatten: true },
        resultsToResolve: { "some_path/some_key": "true" },
        expectedResult: { "some_path/some_key": true },
        baseUrl: defaultUrl.substr(0, defaultUrl.length - 1)
    });


    testsDefenitions.push({
        pathToFetch: '_',
        expectedUrl: `${defaultUrl}_`,
        expectedQueryParams: `?$flatten=true`,
        config: { casing: "camelCase", convertTyping: true, flatten: true },
        resultsToResolve: { "some_path/some_key": "true" },
        expectedResult: { "some_path/some_key": true },
        baseUrl: defaultUrl.substr(0, defaultUrl.length - 1)
    });

    testsDefenitions.forEach(test =>
        it('should execute fetch correctly', async () => {
            // Arrange
            const { tweekClient, restGetterStub } = prepare(test.baseUrl);
            if (!!test.resultsToResolve) restGetterStub.returns(Promise.resolve(test.resultsToResolve));
            const expectedUrl = test.expectedUrl + tweekClient.queryParamsEncoder(test.expectedQueryParams || '');

            // Act
            const result = await tweekClient.fetch(test.pathToFetch, test.config);

            // Assert
            expect(restGetterStub).to.have.been.calledOnce;
            expect(restGetterStub).to.have.been.calledWithExactly(expectedUrl);
            if (!!test.expectedResult)
                expect(result).to.eql(test.expectedResult, 'should return corerct keys result');
        }));
})
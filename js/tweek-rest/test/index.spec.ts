import 'mocha';
import sinon = require('sinon');
import chai = require('chai');
import sinonChai = require('sinon-chai');
import { TweekConfig } from '../index';
chai.use(sinonChai);
let {expect} = chai;

import { TweekClient } from '../index';

describe("tweek client", () => {
    const baseUrl = 'test';
    let prepare = () => {
        let stub = sinon.stub();
        return {
            client: new TweekClient({
                baseServiceUrl: baseUrl,
                casing: "snake",
                convertTyping: false,
                restGetter: stub
            }),
            stub
        };
    };

    const encode$symbol = encodeURIComponent('$');
    const encodeSlashsymbol = encodeURIComponent('/');

    const testsDefenitions: {
        keysToQuery: string[],
        expectedUrl: string,
        serverResults?: Object
        config?: Partial<TweekConfig>,
        expectedResult?: Object,
    }[] = [];

    testsDefenitions.push({
        keysToQuery: ['abc'],
        expectedUrl: `${baseUrl}?include=abc`
    });

    testsDefenitions.push({
        keysToQuery: ['path1', 'path2/key', 'path3/_'],
        expectedUrl: baseUrl + '?' + `include=path1&include=path2${encodeSlashsymbol}key&include=path3${encodeSlashsymbol}_`
    });

    testsDefenitions.push({
        keysToQuery: ['_'],
        expectedUrl: `${baseUrl}?include=_&user.gender=male&user.id=userid`,
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
        keysToQuery: ['_'],
        expectedUrl: `${baseUrl}?include=_`,
        config: { casing: "camelCase" },
        serverResults: { some_path: { some_key: "abc" } },
        expectedResult: { somePath: { someKey: "abc" } }
    });

    testsDefenitions.push({
        keysToQuery: ['_'],
        expectedUrl: `${baseUrl}?include=_`,
        config: { casing: "snake" },
        serverResults: { some_path: { some_key: "abc" } },
        expectedResult: { some_path: { some_key: "abc" } }
    });

    testsDefenitions.push({
        keysToQuery: ['_'],
        expectedUrl: `${baseUrl}?include=_`,
        config: { convertTyping: true },
        serverResults: { some_path: { some_key: "true" } },
        expectedResult: { some_path: { some_key: true } }
    });

    testsDefenitions.push({
        keysToQuery: ['_'],
        expectedUrl: baseUrl + '?' + `${encode$symbol}flatten=true&include=_`,
        config: { casing: "camelCase", convertTyping: true, flatten: true },
        serverResults: { "some_path/some_key": "true" },
        expectedResult: { "some_path/some_key": true }
    });

    testsDefenitions.forEach(test =>
        it('should execute fetch correctly', async () => {
            // Arrange
            const {client, stub} = prepare();
            if (!!test.serverResults) stub.returns(Promise.resolve(test.serverResults));

            // Act
            const result = await client.fetch(test.keysToQuery, test.config);

            // Assert
            expect(stub).to.have.been.calledOnce;
            if (!!test.expectedUrl)
                expect(stub).to.have.been.calledWithExactly(test.expectedUrl);
            if (!!test.expectedResult)
                expect(result).to.eql(test.expectedResult, 'should return corerct keys result');
        }));
})
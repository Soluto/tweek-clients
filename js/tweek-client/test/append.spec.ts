import 'mocha';
import sinon = require('sinon');
import chai = require('chai');
import sinonChai = require('sinon-chai');
import chaiAsProised = require('chai-as-promised');
import { FetchConfig } from '../index';
chai.use(sinonChai);
chai.use(chaiAsProised);
let {expect} = chai;

import { TweekClient } from '../index';

import 'sinon-as-promised';

describe("tweek rest appendContext", () => {
    const defaultUrl = 'http://test';
    let prepare = (url) => {
        const fetchStub = sinon.stub();

        const tweekClient = new TweekClient({
            baseServiceUrl: url || defaultUrl,
            casing: "snake",
            convertTyping: false,
            fetch: fetchStub
        });

        return {
            tweekClient,
            fetchStub
        };
    };

    const testsDefenitions: {
        identityType: string,
        identityId: string,
        expectedUrl: string,
        expectedSuccess: boolean,
        baseUrl?: string,
        context: object,
    }[] = [];


    testsDefenitions.push({
        identityId: 'abcd1234',
        identityType: 'user',
        expectedUrl: `${defaultUrl}/api/v1/context/user/abcd1234`,
        expectedSuccess: true,
        context: {
            name: "SomeName",
            lastName: "SomeLastName",
            age: 42,
        },
    });

    testsDefenitions.push({
        identityId: 'a1b2c3d4',
        identityType: 'device',
        expectedUrl: `${defaultUrl}/api/v1/context/device/a1b2c3d4`,
        expectedSuccess: false,
        context: {
            osType: "Android",
            osVersion: "6.0",
            batteryPercentage: 99.1,
        },
    });

    testsDefenitions.forEach(test => {
        it("should execute appendContext correctly", async () => {
            // Arrange
            const { tweekClient, fetchStub } = prepare(test.baseUrl);
            if (test.expectedSuccess) {
                fetchStub.resolves(new Response());
            }
            else {
                fetchStub.rejects("Error!")
            }
            const expectedCallArgs = [test.expectedUrl, { method: 'POST', body: test.context }];

            // Act
            let testPromise = tweekClient.appendContext(test.identityType, test.identityId, test.context);

            // Assert
            expect(fetchStub).to.have.been.calledOnce;
            expect(fetchStub).to.have.been.calledWith(...expectedCallArgs);
            if(!test.expectedSuccess) {
                expect(testPromise).to.be.rejectedWith(Error, "Error");
            }
            else {
                expect(testPromise).to.be.fulfilled;
            }
        });
    });
});
declare const global: any;

import 'mocha';
import 'isomorphic-fetch';
import sinon = require('sinon');
import chai = require('chai');
import sinonChai = require('sinon-chai');
import chaiAsProised = require('chai-as-promised');
import fetchMock = require('fetch-mock');

import { createTweekClient } from '../index';

chai.use(sinonChai);
chai.use(chaiAsProised);
let {expect} = chai;

describe('tweek-rest authentication', () => {
    const baseServiceUrl = 'http://test/';
    const matcherName = 'authentication';
    const token = 'expected_token';
    const url = 'expected_url';
    const expectedOptions = {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    };

    beforeEach(() => {
        fetchMock.getOnce('*', {},{
            name: matcherName,
        });
    });

    it('authentication token should be passed to fetch request', async () => {
        // Arrange
        const getAuthenticationToken = sinon.stub().returns(token);
        const tweekClient = createTweekClient({
            baseServiceUrl,
            getAuthenticationToken
        });

        // Act
        await tweekClient.fetch(url);

        // Assert
        expect(getAuthenticationToken).to.have.been.called;
        expect(fetchMock.lastOptions(matcherName)).to.deep.equal(expectedOptions);
    });

    it('authentication token promise should be passed to fetch request', async () => {
        // Arrange
        const getAuthenticationToken = sinon.stub().resolves(token);
        const tweekClient = createTweekClient({
            baseServiceUrl,
            getAuthenticationToken
        });

        // Act
        await tweekClient.fetch(url);

        // Assert
        expect(getAuthenticationToken).to.have.been.called;
        expect(fetchMock.lastOptions(matcherName)).to.deep.equal(expectedOptions);
    });

    it('should not fail if getAuthenticationToken is not passed', () => {
        // Arrange
        const tweekClient = createTweekClient({
            baseServiceUrl,
        });

        const testPromise = tweekClient.fetch(url);
        
        expect(testPromise).to.be.fulfilled;
    });
});

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TestUtils from 'react-dom/test-utils';
import Provider, { createProvider } from './Provider';

const repositoryMock = {
  prepare: jest.fn(),
  get: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('tweek-client', () => {
  const createTweekClient = jest.fn();
  return { createTweekClient };
});
jest.mock('tweek-local-cache', () => {
  const tweekLocalCacheMock = jest.fn(() => ({
    prepare: jest.fn(),
    get: jest.fn(),
    refresh: jest.fn(),
  }));
  return { default: tweekLocalCacheMock };
});

const createChild = (repoKey = 'repo') => {
  return class extends Component {
    static contextTypes = {
      [repoKey]: PropTypes.object.isRequired,
    };

    render() {
      return <div />;
    }
  };
};

describe('Provider', () => {
  const Child = createChild();
  const { createTweekClient: createTweekClientMock } = require('tweek-client');
  const { default: tweekLocalCacheMock } = require('tweek-local-cache');

  it('should add the store to the child context', () => {
    const tree = TestUtils.renderIntoDocument(
      <Provider repo={repositoryMock}>
        <Child />
      </Provider>,
    );
    const child = TestUtils.findRenderedComponentWithType(tree, Child);
    expect(child.context.repo).toBe(repositoryMock);
  });

  it('should add the store to the child context using a custom store key', () => {
    const repoKey = 'customRepoKey';
    const CustomProvider = createProvider({ repoKey });
    const CustomChild = createChild(repoKey);

    const tree = TestUtils.renderIntoDocument(
      <CustomProvider repo={repositoryMock}>
        <CustomChild />
      </CustomProvider>,
    );

    const child = TestUtils.findRenderedComponentWithType(tree, CustomChild);
    expect(child.context.customRepoKey).toBe(repositoryMock);
  });

  it('should create a repository if client is passed', () => {
    const tree = TestUtils.renderIntoDocument(
      <Provider client={repositoryMock}>
        <Child />
      </Provider>,
    );

    TestUtils.findRenderedComponentWithType(tree, Child);

    expect(tweekLocalCacheMock).toBeCalled();
  });

  it('should create client and repository if baseServiceUrl is passed', () => {
    const baseServiceUrl = 'someUrl';
    const tree = TestUtils.renderIntoDocument(
      <Provider baseServiceUrl={baseServiceUrl}>
        <Child />
      </Provider>,
    );

    TestUtils.findRenderedComponentWithType(tree, Child);

    expect(createTweekClientMock).toBeCalledWith({ baseServiceUrl });
    expect(tweekLocalCacheMock).toBeCalled();
  });
});

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
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

const createChild = (repoKey = 'tweekRepo') => {
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
    const component = renderer.create(
      <Provider repo={repositoryMock as any}>
        <Child />
      </Provider>,
    );

    const child = component.root.findByType(Child);
    expect(child.instance.context.tweekRepo).toBe(repositoryMock);
  });

  it('should add the store to the child context using a custom store key', () => {
    const repoKey = 'customRepoKey';
    const CustomProvider = createProvider({ repoKey });
    const CustomChild = createChild(repoKey);

    const component = renderer.create(
      <CustomProvider repo={repositoryMock as any}>
        <CustomChild />
      </CustomProvider>,
    );

    const child = component.root.findByType(CustomChild);
    expect(child.instance.context.customRepoKey).toBe(repositoryMock);
  });

  it('should create a repository if client is passed', () => {
    renderer.create(
      <Provider client={repositoryMock as any}>
        <Child />
      </Provider>,
    );

    expect(tweekLocalCacheMock).toBeCalled();
  });

  it('should create client and repository if baseServiceUrl is passed', () => {
    const baseServiceUrl = 'someUrl';
    renderer.create(
      <Provider baseServiceUrl={baseServiceUrl}>
        <Child />
      </Provider>,
    );

    expect(createTweekClientMock).toBeCalledWith({ baseServiceUrl });
    expect(tweekLocalCacheMock).toBeCalled();
  });
});

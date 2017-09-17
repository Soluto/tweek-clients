import React from 'react';
import renderer from 'react-test-renderer';
import Provider from './Provider';
import withTweekKeys from './withTweekKeys';

const repositoryMock = result => ({
  prepare: jest.fn(),
  get: jest.fn().mockReturnValue(result),
  refresh: jest.fn().mockReturnValue(Promise.resolve()),
});

describe('withTweekKeys', () => {
  const value = 'someValue';
  let tweekRepositoryMock;

  const renderComponent = async (path, config) => {
    const withTweekKeysHoc = withTweekKeys(path, config);
    const Component = withTweekKeysHoc('div');
    const result = renderer.create(
      <Provider repo={tweekRepositoryMock}>
        <Component />
      </Provider>,
    );
    await Promise.resolve(true);
    return result;
  };

  describe('get single key', () => {
    const path = 'path/someKey';

    beforeEach(() => {
      tweekRepositoryMock = repositoryMock(Promise.resolve({ value }));
    });

    test('default behavior', async () => {
      const component = await renderComponent(path);

      expect(tweekRepositoryMock.get).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);
    });

    test('with {mergeProps: true}', async () => {
      const component = await renderComponent(path, { mergeProps: true, propName: undefined });

      expect(tweekRepositoryMock.get).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);
    });

    test('with {mergeProps: true, propName: someName}', async () => {
      const component = await renderComponent(path, { mergeProps: true, propName: 'someName' });

      expect(tweekRepositoryMock.get).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someName).toBe(value);
    });

    test('with {mergeProps: false}', async () => {
      const component = await renderComponent(path, { mergeProps: false, propName: undefined });

      expect(tweekRepositoryMock.get).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.tweek).toBeDefined();
      expect(tree.props.tweek.someKey).toBe(value);
    });

    test('with {mergeProps: false, propName: someName}', async () => {
      const component = await renderComponent(path, { mergeProps: false, propName: 'someName' });

      expect(tweekRepositoryMock.get).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someName).toBeDefined();
      expect(tree.props.someName.someKey).toBe(value);
    });
  });

  describe('scan category', () => {
    const path = 'path/_';

    beforeEach(() => {
      tweekRepositoryMock = repositoryMock(Promise.resolve({ someKey: value }));
    });

    test('default behavior', async () => {
      const component = await renderComponent(path);

      expect(tweekRepositoryMock.get).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);
    });

    test('with {mergeProps: true}', async () => {
      const component = await renderComponent(path, { mergeProps: true, propName: undefined });

      expect(tweekRepositoryMock.get).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);
    });

    test('with {mergeProps: true, propName: someName} should ignore propName', async () => {
      const component = await renderComponent(path, { mergeProps: true, propName: 'someName' });

      expect(tweekRepositoryMock.get).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);
    });

    test('with {mergeProps: false}', async () => {
      const component = await renderComponent(path, { mergeProps: false, propName: undefined });

      expect(tweekRepositoryMock.get).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.tweek).toBeDefined();
      expect(tree.props.tweek.someKey).toBe(value);
    });

    test('with {mergeProps: false, propName: someName}', async () => {
      const component = await renderComponent(path, { mergeProps: false, propName: 'someName' });

      expect(tweekRepositoryMock.get).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someName).toBeDefined();
      expect(tree.props.someName.someKey).toBe(value);
    });
  });

  test('with error handler', async () => {
    let error = null;
    let expectedError = 'test error';
    const path = 'path/someKey';
    tweekRepositoryMock = repositoryMock(Promise.reject(expectedError));

    await renderComponent(path, { onError: e => (error = e) });

    expect(error).toEqual(expectedError);
  });

  test('with getPolicy', async () => {
    const path = 'path/someKey';
    const getPolicy = 'somePolicy';
    tweekRepositoryMock = repositoryMock(Promise.resolve({ value }));

    await renderComponent(path, { getPolicy });

    expect(tweekRepositoryMock.get).toBeCalledWith(path, getPolicy);
  });
});

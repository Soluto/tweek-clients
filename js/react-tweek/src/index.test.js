import React from 'react';
import renderer from 'react-test-renderer';
import Provider from './Provider';
import withTweekKeys from './withTweekKeys';

const generateTweekRepository = result => {
  const getMock = jest.fn();
  getMock.mockReturnValue(result);
  return {
    prepare: jest.fn(),
    get: getMock,
    refresh: jest.fn().mockReturnValue(Promise.resolve()),
  };
};

const renderComponent = async (repo, path, config) => {
  const withTweekKeysHoc = withTweekKeys(path, config);
  const Component = withTweekKeysHoc('div');
  const result = renderer.create(
    <Provider repo={repo}>
      <Component />
    </Provider>,
  );
  await Promise.resolve(true);
  return result;
};

describe('withTweekKeys get single key', () => {
  const path = 'path/someKey';
  const value = 'someValue';
  let tweekRepositoryMock;

  beforeEach(() => {
    tweekRepositoryMock = generateTweekRepository(Promise.resolve({ value }));
  });

  test('default behavior', async () => {
    const component = await renderComponent(tweekRepositoryMock, path);

    expect(tweekRepositoryMock.get).toBeCalled();

    let tree = component.toJSON();
    expect(tree.props.someKey).toBe(value);
  });

  test('with {mergeProps: true}', async () => {
    const component = await renderComponent(tweekRepositoryMock, path, { mergeProps: true, propName: undefined });

    expect(tweekRepositoryMock.get).toBeCalled();

    let tree = component.toJSON();
    expect(tree.props.someKey).toBe(value);
  });

  test('with {mergeProps: true, propName: someName}', async () => {
    const component = await renderComponent(tweekRepositoryMock, path, { mergeProps: true, propName: 'someName' });

    expect(tweekRepositoryMock.get).toBeCalled();

    let tree = component.toJSON();
    expect(tree.props.someName).toBe(value);
  });

  test('with {mergeProps: false}', async () => {
    const component = await renderComponent(tweekRepositoryMock, path, { mergeProps: false, propName: undefined });

    expect(tweekRepositoryMock.get).toBeCalled();

    let tree = component.toJSON();
    expect(tree.props.tweek).toBeDefined();
    expect(tree.props.tweek.someKey).toBe(value);
  });

  test('with {mergeProps: false, propName: someName}', async () => {
    const component = await renderComponent(tweekRepositoryMock, path, { mergeProps: false, propName: 'someName' });

    expect(tweekRepositoryMock.get).toBeCalled();

    let tree = component.toJSON();
    expect(tree.props.someName).toBeDefined();
    expect(tree.props.someName.someKey).toBe(value);
  });

  // test('with shouldPrepare=false', async () => {
  //   usePrepare(false);
  //
  //   const component = await renderComponent(tweekRepositoryMock, path);
  //
  //   expect(tweekRepositoryMock.prepare).toHaveBeenCalledTimes(0);
  // });
  test('with error handler', async () => {
    let error = null;
    let expectedError = 'test error';
    tweekRepositoryMock = generateTweekRepository(Promise.reject(expectedError));
    const component = await renderComponent(tweekRepositoryMock, path, { onError: e => (error = e) });

    expect(error).toEqual(expectedError);
  });
});

describe('withTweekKeys scan category', () => {
  const path = 'path/_';
  const value = 'someValue';
  let tweekRepositoryMock;

  beforeEach(() => {
    tweekRepositoryMock = generateTweekRepository(Promise.resolve({ someKey: value }));
  });

  test('default behavior', async () => {
    const component = await renderComponent(tweekRepositoryMock, path);

    expect(tweekRepositoryMock.get).toBeCalled();

    let tree = component.toJSON();
    expect(tree.props.someKey).toBe(value);
  });

  test('with {mergeProps: true}', async () => {
    const component = await renderComponent(tweekRepositoryMock, path, { mergeProps: true, propName: undefined });

    expect(tweekRepositoryMock.get).toBeCalled();

    let tree = component.toJSON();
    expect(tree.props.someKey).toBe(value);
  });

  test('with {mergeProps: true, propName: someName} should ignore propName', async () => {
    const component = await renderComponent(tweekRepositoryMock, path, { mergeProps: true, propName: 'someName' });

    expect(tweekRepositoryMock.get).toBeCalled();

    let tree = component.toJSON();
    expect(tree.props.someKey).toBe(value);
  });

  test('with {mergeProps: false}', async () => {
    const component = await renderComponent(tweekRepositoryMock, path, { mergeProps: false, propName: undefined });

    expect(tweekRepositoryMock.get).toBeCalled();

    let tree = component.toJSON();
    expect(tree.props.tweek).toBeDefined();
    expect(tree.props.tweek.someKey).toBe(value);
  });

  test('with {mergeProps: false, propName: someName}', async () => {
    const component = await renderComponent(tweekRepositoryMock, path, { mergeProps: false, propName: 'someName' });

    expect(tweekRepositoryMock.get).toBeCalled();

    let tree = component.toJSON();
    expect(tree.props.someName).toBeDefined();
    expect(tree.props.someName.someKey).toBe(value);
  });

  // test('with shouldPrepare=false', async () => {
  //   usePrepare(false);
  //
  //   const component = await renderComponent(tweekRepositoryMock, path);
  //
  //   expect(tweekRepositoryMock.prepare).toHaveBeenCalledTimes(0);
  // });
  test('with error handler', async () => {
    let error = null;
    let expectedError = 'test error';
    tweekRepositoryMock = generateTweekRepository(Promise.reject(expectedError));

    const component = await renderComponent(tweekRepositoryMock, path, { onError: e => (error = e) });

    expect(error).toEqual(expectedError);
  });
});

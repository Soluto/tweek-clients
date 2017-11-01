/* global describe, beforeEach, test, expect, jest */
import React from 'react';
import renderer from 'react-test-renderer';
import Provider from './Provider';
import withTweekKeys from './withTweekKeys';

describe('withTweekKeys', () => {
  const value = 'someValue';
  let observeMock;
  let subscribeMock;
  let unsubscribeMock;

  const mockRepository = (result, isError) => {
    unsubscribeMock = jest.fn();
    subscribeMock = jest.fn(observer => {
      const subscription = { unsubscribe: unsubscribeMock };

      observer.start(subscription);

      if (isError) observer.error(result);
      else observer.next(result);

      return subscription;
    });
    observeMock = jest.fn().mockReturnValue({ subscribe: subscribeMock });
  };

  const renderComponent = (path, config) => {
    const withTweekKeysHoc = withTweekKeys(path, config);
    const Component = withTweekKeysHoc('div');
    const result = renderer.create(
      <Provider repo={{ observe: observeMock }}>
        <Component />
      </Provider>,
    );
    return result;
  };

  describe('get single key', () => {
    const path = 'path/someKey';

    beforeEach(() => {
      mockRepository({ value });
    });

    test('default behavior', () => {
      const component = renderComponent(path);

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: true}', () => {
      const component = renderComponent(path, { mergeProps: true, propName: undefined });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: true, propName: someName}', () => {
      const component = renderComponent(path, { mergeProps: true, propName: 'someName' });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someName).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: false}', () => {
      const component = renderComponent(path, { mergeProps: false, propName: undefined });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.tweek).toBeDefined();
      expect(tree.props.tweek.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: false, propName: someName}', () => {
      const component = renderComponent(path, { mergeProps: false, propName: 'someName' });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someName).toBeDefined();
      expect(tree.props.someName.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });
  });

  describe('scan category', () => {
    const path = 'path/_';

    beforeEach(() => {
      mockRepository({ someKey: value });
    });

    test('default behavior', () => {
      const component = renderComponent(path);

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: true}', () => {
      const component = renderComponent(path, { mergeProps: true, propName: undefined });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: true, propName: someName} should ignore propName', () => {
      const component = renderComponent(path, { mergeProps: true, propName: 'someName' });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: false}', () => {
      const component = renderComponent(path, { mergeProps: false, propName: undefined });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.tweek).toBeDefined();
      expect(tree.props.tweek.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: false, propName: someName}', () => {
      const component = renderComponent(path, { mergeProps: false, propName: 'someName' });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someName).toBeDefined();
      expect(tree.props.someName.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });
  });

  test('with error handler', () => {
    let error = null;
    let expectedError = 'test error';
    const path = 'path/someKey';
    mockRepository(expectedError, true);

    renderComponent(path, { onError: e => (error = e) });

    expect(error).toEqual(expectedError);
    expect(unsubscribeMock).toBeCalled();
  });

  test('with getPolicy', () => {
    const path = 'path/someKey';
    const getPolicy = 'somePolicy';
    mockRepository({ value });

    renderComponent(path, { getPolicy });

    expect(observeMock).toBeCalledWith(path, getPolicy);
  });
});

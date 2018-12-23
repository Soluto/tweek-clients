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

  const mockRepository = ({ result, secondResult, error } = {}) => {
    unsubscribeMock = jest.fn();
    subscribeMock = jest.fn(observer => {
      const subscription = { unsubscribe: unsubscribeMock };

      observer.start(subscription);

      if (error) {
        observer.error(error);
        return subscription;
      }

      if (result !== undefined) {
        observer.next(result);
      }

      if (!unsubscribeMock.mock.calls.length && secondResult) {
        observer.next(secondResult);
      }

      return subscription;
    });
    observeMock = jest.fn().mockReturnValue({ subscribe: subscribeMock });
  };

  const renderComponent = (path, config) => {
    const withTweekKeysHoc = withTweekKeys(path, config);
    const Component = withTweekKeysHoc('div');
    return renderer.create(
      <Provider repo={{ observe: observeMock }}>
        <Component />
      </Provider>,
    );
  };

  describe('get single key', () => {
    const path = 'path/someKey';

    beforeEach(() => {
      mockRepository({ result: { value } });
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

  describe('get key changes', () => {
    const path = 'path/someKey';

    test('with {once: true}', () => {
      mockRepository({ result: { value }, secondResult: { value: 'newValue' } });

      const component = renderComponent(path, { once: true });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBeDefined();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {once: false}', () => {
      mockRepository({ result: { value }, secondResult: { value: 'newValue' } });

      const component = renderComponent(path, { once: false });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBeDefined();
      expect(tree.props.someKey).toBe('newValue');

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with initialValue', () => {
      const initialValue = 'someInitialValue';
      mockRepository();
      const component = renderComponent(path, { initialValue });
      const tree = component.toJSON();
      expect(tree.props.someKey).toBe(initialValue);
    });
  });

  describe('scan category', () => {
    const path = 'path/_';

    beforeEach(() => {
      mockRepository({ result: { someKey: value } });
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

    test('with initialValue', () => {
      const initialValue = 'someInitialValue';
      mockRepository();
      const component = renderComponent(path, { initialValue: { someKey: initialValue } });
      const tree = component.toJSON();
      expect(tree.props.someKey).toBe(initialValue);
    });
  });

  test('with error handler', () => {
    let error = null;
    let expectedError = 'test error';
    const path = 'path/someKey';
    mockRepository({ error: expectedError });

    renderComponent(path, { onError: e => (error = e) });

    expect(error).toEqual(expectedError);
    expect(unsubscribeMock).toBeCalled();
  });

  test('with getPolicy', () => {
    const path = 'path/someKey';
    const getPolicy = 'somePolicy';
    mockRepository({ result: { value } });

    renderComponent(path, { getPolicy });

    expect(observeMock).toBeCalledWith(path, getPolicy);
  });
});

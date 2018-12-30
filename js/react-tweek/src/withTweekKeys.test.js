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

  const mockRepository = ({ results, error } = {}) => {
    unsubscribeMock = jest.fn();
    subscribeMock = jest.fn((onNext, onError) => {
      const subscription = { unsubscribe: unsubscribeMock };

      if (error) {
        setImmediate(() => onError(error));
      }

      if (results) {
        results.forEach(result => {
          setImmediate(() => {
            if (!unsubscribeMock.mock.calls.length) {
              onNext(result);
            }
          });
        });
      }

      return subscription;
    });
    observeMock = jest.fn().mockReturnValue({ subscribe: subscribeMock });
  };

  const renderComponent = async (path, config) => {
    const withTweekKeysHoc = withTweekKeys(path, config);
    const Component = withTweekKeysHoc('div');
    const component = renderer.create(
      <Provider repo={{ observe: observeMock }}>
        <Component />
      </Provider>,
    );

    await new Promise(res => setImmediate(res));
    return component;
  };

  describe('get single key', () => {
    const path = 'path/someKey';

    beforeEach(() => {
      mockRepository({ results: [{ value }] });
    });

    test('default behavior', async () => {
      const component = await renderComponent(path);

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: true}', async () => {
      const component = await renderComponent(path, { mergeProps: true, propName: undefined });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: true, propName: someName}', async () => {
      const component = await renderComponent(path, { mergeProps: true, propName: 'someName' });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someName).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: false}', async () => {
      const component = await renderComponent(path, { mergeProps: false, propName: undefined });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.tweek).toBeDefined();
      expect(tree.props.tweek.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: false, propName: someName}', async () => {
      const component = await renderComponent(path, { mergeProps: false, propName: 'someName' });

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

    test('with {once: true}', async () => {
      mockRepository({ results: [{ value }, { value: 'newValue' }] });

      const component = await renderComponent(path, { once: true });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBeDefined();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {once: false}', async () => {
      mockRepository({ results: [{ value }, { value: 'newValue' }] });

      const component = await renderComponent(path, { once: false });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBeDefined();
      expect(tree.props.someKey).toBe('newValue');

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with initialValue', async () => {
      const initialValue = 'someInitialValue';
      mockRepository();
      const component = await renderComponent(path, { initialValue });
      const tree = component.toJSON();
      expect(tree.props.someKey).toBe(initialValue);
    });
  });

  describe('scan category', () => {
    const path = 'path/_';

    beforeEach(() => {
      mockRepository({ results: [{ someKey: value }] });
    });

    test('default behavior', async () => {
      const component = await renderComponent(path);

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: true}', async () => {
      const component = await renderComponent(path, { mergeProps: true, propName: undefined });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: true, propName: someName} should ignore propName', async () => {
      const component = await renderComponent(path, { mergeProps: true, propName: 'someName' });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: false}', async () => {
      const component = await renderComponent(path, { mergeProps: false, propName: undefined });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.tweek).toBeDefined();
      expect(tree.props.tweek.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with {mergeProps: false, propName: someName}', async () => {
      const component = await renderComponent(path, { mergeProps: false, propName: 'someName' });

      expect(observeMock).toBeCalledWith(path, undefined);
      expect(subscribeMock).toBeCalled();

      let tree = component.toJSON();
      expect(tree.props.someName).toBeDefined();
      expect(tree.props.someName.someKey).toBe(value);

      component.unmount();
      expect(unsubscribeMock).toBeCalled();
    });

    test('with initialValue', async () => {
      const initialValue = 'someInitialValue';
      mockRepository();
      const component = await renderComponent(path, { initialValue: { someKey: initialValue } });
      const tree = component.toJSON();
      expect(tree.props.someKey).toBe(initialValue);
    });
  });

  test('with error handler', async () => {
    let error = null;
    let expectedError = 'test error';
    const path = 'path/someKey';
    mockRepository({ error: expectedError });

    await renderComponent(path, { onError: e => (error = e) });

    expect(error).toEqual(expectedError);
    expect(unsubscribeMock).toBeCalled();
  });

  test('with getPolicy', async () => {
    const path = 'path/someKey';
    const getPolicy = 'somePolicy';
    mockRepository({ results: [{ value }] });

    await renderComponent(path, { getPolicy });

    expect(observeMock).toBeCalledWith(path, getPolicy);
  });
});

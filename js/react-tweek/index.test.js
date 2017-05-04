import {connect, withTweekKeys, usePrepare, setErrorHandler} from './dist/index';
import React from 'react';
import renderer from 'react-test-renderer';

const generateTweekRepository = (result) => {
    const getMock = jest.fn();
    getMock.mockReturnValue(result);
    return {
        prepare: jest.fn(),
        get: getMock
    };
};

const renderComponent = async (path, config) => {
    const withTweekKeysHoc = withTweekKeys(path, config);
    const Component = withTweekKeysHoc('div');
    const result = renderer.create(<Component />);
    await Promise.resolve(true);
    return result;
};

describe("withTweekKeys get single key", () => {
    const path = "path/someKey";
    const value = "someValue";
    let tweekRepositoryMock;

    beforeEach(() => {
        tweekRepositoryMock = generateTweekRepository(Promise.resolve({value}));
        connect(tweekRepositoryMock);
    });

    test('default behavior', async () => {
        const component = await renderComponent(path);

        expect(tweekRepositoryMock.get).toBeCalled();

        let tree = component.toJSON();
        expect(tree.props.someKey).toBe(value);
    });

     test('with {mergeProps: true}', async () => {
        const component = await renderComponent(path, {mergeProps: true, propName: undefined});

        expect(tweekRepositoryMock.get).toBeCalled();

        let tree = component.toJSON();
        expect(tree.props.someKey).toBe(value);
    });

    test('with {mergeProps: true, propName: someName}', async () => {
        const component = await renderComponent(path, {mergeProps: true, propName: "someName"});

        expect(tweekRepositoryMock.get).toBeCalled();

        let tree = component.toJSON();
        expect(tree.props.someName).toBe(value);
    });

     test('with {mergeProps: false}', async () => {
        const component = await renderComponent(path, {mergeProps: false, propName: undefined});

        expect(tweekRepositoryMock.get).toBeCalled();

        let tree = component.toJSON();
        expect(tree.props.tweek).toBeDefined();
        expect(tree.props.tweek.someKey).toBe(value);
    });

    test('with {mergeProps: false, propName: someName}', async () => {
        const component = await renderComponent(path, {mergeProps: false, propName: "someName"});

        expect(tweekRepositoryMock.get).toBeCalled();

        let tree = component.toJSON();
        expect(tree.props.someName).toBeDefined();
        expect(tree.props.someName.someKey).toBe(value);
    });

    test('with shouldPrepare=false', async () => {
        usePrepare(false);

        const component = await renderComponent(path);

        expect(tweekRepositoryMock.prepare).toHaveBeenCalledTimes(0);
    });
    test('with error handler', async ()=> {
        let error = null;
        let expectedError = "test error";
        setErrorHandler((e) => error = e);
        tweekRepositoryMock = generateTweekRepository(Promise.reject(expectedError));
        connect(tweekRepositoryMock);

        const component = await renderComponent(path);

        expect(error).toEqual(expectedError);
    });
})

describe("withTweekKeys scan category", () => {
    const path = "path/_";
    const value = "someValue";
    let tweekRepositoryMock;

    beforeEach(() => {
        tweekRepositoryMock = generateTweekRepository(Promise.resolve({someKey: value}));
        connect(tweekRepositoryMock);
    });

    test('default behavior', async () => {
        const component = await renderComponent(path);

        expect(tweekRepositoryMock.get).toBeCalled();

        let tree = component.toJSON();
        expect(tree.props.someKey).toBe(value);
    });


     test('with {mergeProps: true}', async () => {
        const component = await renderComponent(path, {mergeProps: true, propName: undefined});

        expect(tweekRepositoryMock.get).toBeCalled();

        let tree = component.toJSON();
        expect(tree.props.someKey).toBe(value);
    });

    test('with {mergeProps: true, propName: someName} should ignore propName', async () => {
        const component = await renderComponent(path, {mergeProps: true, propName: "someName"});

        expect(tweekRepositoryMock.get).toBeCalled();

        let tree = component.toJSON();
        expect(tree.props.someKey).toBe(value);
    });

     test('with {mergeProps: false}', async () => {
        const component = await renderComponent(path, {mergeProps: false, propName: undefined});

        expect(tweekRepositoryMock.get).toBeCalled();

        let tree = component.toJSON();
        expect(tree.props.tweek).toBeDefined();
        expect(tree.props.tweek.someKey).toBe(value);
    });

    test('with {mergeProps: false, propName: someName}', async () => {
        const component = await renderComponent(path, {mergeProps: false, propName: "someName"});

        expect(tweekRepositoryMock.get).toBeCalled();

        let tree = component.toJSON();
        expect(tree.props.someName).toBeDefined();
        expect(tree.props.someName.someKey).toBe(value);
    });

    test('with shouldPrepare=false', async () => {
        usePrepare(false);

        const component = await renderComponent(path);

        expect(tweekRepositoryMock.prepare).toHaveBeenCalledTimes(0);
    });
    test('with error handler', async ()=> {
        let error = null;
        let expectedError = "test error";
        setErrorHandler((e) => error = e);
        tweekRepositoryMock = generateTweekRepository(Promise.reject(expectedError));
        connect(tweekRepositoryMock);

        const component = await renderComponent(path);

        expect(error).toEqual(expectedError);
    });
})

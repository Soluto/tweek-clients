import {connect, withTweekKeys} from './index';
import React from 'react';
import renderer from 'react-test-renderer';

const generateTweekRepository = (result) => {
    const getMock = jest.fn();
    getMock.mockReturnValue(Promise.resolve(result));
    return {
        prepare: jest.fn(),
        get: getMock,
        refresh: jest.fn()
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
    const tweekRepositoryMock = generateTweekRepository({value});

    beforeAll(() => {
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
})

describe("withTweekKeys scan category", () => {
    const path = "path/_";
    const value = "someValue";
    const tweekRepositoryMock = generateTweekRepository({someKey: value});

    beforeAll(() => {
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
})

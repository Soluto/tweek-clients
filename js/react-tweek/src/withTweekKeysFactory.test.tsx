import React, { Component, Context } from 'react';
import renderer from 'react-test-renderer';
import { NotPreparedPolicy, TweekRepository } from 'tweek-local-cache';
import withTweekKeysFactory, { WithTweekKeys } from './withTweekKeysFactory';

type TweekProps = {
  singleKey: string;
  scanKey: {
    a: string;
    b: string;
  }
}

class Child extends Component<TweekProps> {
  render() {
    return null;
  }
}

const mapping = {singleKey: 'single_key', scanKey: 'scan_key/_'};

const waitImmediate = () => new Promise(res => setImmediate(res));

describe('withTweekKeysFactory', () => {
  let repository: TweekRepository;
  let TweekContext: Context<TweekRepository>;
  let prepareMock: jest.Mock;
  let withTweekKeys: WithTweekKeys;

  beforeEach(() => {
    repository = new TweekRepository({client: {} as any});
    TweekContext = React.createContext(repository);
    prepareMock = jest.fn();
    withTweekKeys = withTweekKeysFactory(TweekContext, prepareMock);
  });

  test('renders only if all keys are present', () => {
    const observeMock = jest.fn().mockReturnValue({subscribe: jest.fn().mockReturnValue(jest.fn())});
    const withTweekKeysHoc = withTweekKeys<TweekProps>(mapping);

    Object.values(mapping).forEach(key => expect(prepareMock).toHaveBeenCalledWith(key));

    const EnhancedComponent = withTweekKeysHoc<TweekProps>(Child);
    const component = renderer.create(
      <TweekContext.Provider value={{observe: observeMock} as any}>
        <EnhancedComponent/>
      </TweekContext.Provider>
    );

    Object.values(mapping).forEach(path => expect(observeMock).toHaveBeenCalledWith(path, undefined));

    const tree = component.toJSON();
    expect(tree).toBeNull();
  });

  test('maps key values to base component', async () => {
    const expectedProps = {
      singleKey: 'single value',
      scanKey: {
        a: 'a scan value',
        b: 'b scan value',
      },
      someProp: 'some value'
    };
    repository.addKeys({
      single_key: expectedProps.singleKey,
      'scan_key/_': expectedProps.scanKey
    });

    const withTweekKeysHoc = withTweekKeys(mapping);

    Object.values(mapping).forEach(key => expect(prepareMock).toHaveBeenCalledWith(key));

    const EnhancedComponent = withTweekKeysHoc(Child);
    const component = renderer.create(<EnhancedComponent someProp={expectedProps.someProp} />);

    await waitImmediate();

    const child = component.root.findByType(Child);

    expect(child.props).toEqual(expectedProps);
  });

  test('renders changes', async () => {
    const expectedProps = {
      singleKey: 'single value',
      scanKey: {
        a: 'a scan value',
        b: 'b scan value',
      },
    };
    repository.addKeys({
      single_key: 'expectedProps.singleKey',
      'scan_key/_': {
        a: 'expectedProps.scanKey.a',
        b: 'expectedProps.scanKey.b'
      }
    });

    const withTweekKeysHoc = withTweekKeys<TweekProps>(mapping);

    Object.values(mapping).forEach(key => expect(prepareMock).toHaveBeenCalledWith(key));

    const EnhancedComponent = withTweekKeysHoc<TweekProps>(Child);
    const component = renderer.create(<EnhancedComponent/>);

    repository.addKeys({
      single_key: expectedProps.singleKey,
      'scan_key/_': expectedProps.scanKey
    });

    await waitImmediate();

    const child = component.root.findByType(Child);

    expect(child.props).toEqual(expectedProps);
  });

  test('with getPolicy', async () => {
    const getPolicy = {
      notPrepared: NotPreparedPolicy.throw
    };
    const observe = jest.fn().mockReturnValue({subscribe: jest.fn()});
    const withTweekKeysHoc = withTweekKeys<TweekProps>(mapping, { getPolicy });

    const EnhancedComponent = withTweekKeysHoc<TweekProps>(Child);
    renderer.create(
      <TweekContext.Provider value={{observe: observe} as any}>
        <EnhancedComponent/>
      </TweekContext.Provider>
    );

    expect(prepareMock).not.toHaveBeenCalled();
    Object.values(mapping).forEach(path => expect(observe).toHaveBeenCalledWith(path, getPolicy))
  });

  test('with error handler', async () => {
    const error = 'someError';
    const observe = jest.fn().mockReturnValue({
      subscribe: jest.fn((_, onError) => {
        onError(error);

        return { unsubscribe: jest.fn() };
      }),
    });
    const onError = jest.fn();

    const withTweekKeysHoc = withTweekKeys<TweekProps>(mapping, { onError });

    const EnhancedComponent = withTweekKeysHoc<TweekProps>(Child);
    renderer.create(
      <TweekContext.Provider value={{observe} as any}>
        <EnhancedComponent/>
      </TweekContext.Provider>
    );

    expect(onError).toHaveBeenCalledWith(error);
  });

  test('unsubscribe when unloads', () => {
    const unsubscribe = jest.fn();
    const observe = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue({unsubscribe}),
    });
    const withTweekKeysHoc = withTweekKeys<TweekProps>(mapping);

    const EnhancedComponent = withTweekKeysHoc<TweekProps>(Child);
    const component = renderer.create(
      <TweekContext.Provider value={{observe} as any}>
        <EnhancedComponent/>
      </TweekContext.Provider>
    );
    component.unmount();

    expect(unsubscribe).toHaveBeenCalled();
  })
});

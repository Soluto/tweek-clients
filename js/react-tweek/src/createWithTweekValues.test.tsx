import React, { Component, Context } from 'react';
import renderer from 'react-test-renderer';
import {
  MemoryStore,
  RepositoryKeyState,
  TweekRepository,
  StoredKey,
  CachedScanKey,
  MissingKey,
} from 'tweek-local-cache';
import { createWithTweekValues, WithTweekValues } from './createWithTweekValues';
import { OptionalTweekRepository } from './types';

type TweekProps = {
  singleKey: string;
  scanKey: {
    a?: string;
    b?: string;
  };
  missingKey?: string;
};

class Child extends Component<TweekProps & { someProp?: any }> {
  render() {
    return null;
  }
}

const mapping = { singleKey: 'single_key', scanKey: 'scan_key/_', missingKey: 'missing_key' };

const scanKey: CachedScanKey = {
  state: RepositoryKeyState.cached,
  isScan: true,
};

const cachedKey = (value: any): StoredKey<any> =>
  ({
    state: RepositoryKeyState.cached,
    value,
    isScan: false,
  } as any);

const missingKey: MissingKey = {
  state: RepositoryKeyState.missing,
  isScan: false,
};

const createMockRepository = (unsubscribe = jest.fn(), listen = jest.fn()): any => ({
  listen: listen.mockReturnValue(unsubscribe),
  getCached: jest.fn(),
  prepare: jest.fn(),
});

describe('createWithTweekValues', () => {
  let repository: TweekRepository;
  let TweekContext: Context<TweekRepository>;
  let prepareMock: jest.Mock;
  let withTweekValues: WithTweekValues;

  beforeEach(() => {
    repository = new TweekRepository({ client: {} as any });
    TweekContext = React.createContext(repository);
    prepareMock = jest.fn();
    withTweekValues = createWithTweekValues(TweekContext as Context<OptionalTweekRepository>, prepareMock);
  });

  test('renders only if all keys are present', () => {
    const mockRepository = createMockRepository();
    const enhance = withTweekValues<TweekProps>(mapping);

    Object.values(mapping).forEach(key => expect(prepareMock).toHaveBeenCalledWith(key));

    const EnhancedComponent = enhance(Child);
    const component = renderer.create(
      <TweekContext.Provider value={mockRepository}>
        <EnhancedComponent />
      </TweekContext.Provider>,
    );

    expect(mockRepository.listen).toHaveBeenCalledTimes(1);

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
      someProp: 'some value',
    };
    await repository.useStore(
      new MemoryStore({
        single_key: cachedKey(expectedProps.singleKey),
        'scan_key/a': cachedKey(expectedProps.scanKey.a),
        'scan_key/b': cachedKey(expectedProps.scanKey.b),
        missing_key: missingKey,
        'scan_key/_': scanKey,
      }),
    );

    const enhance = withTweekValues<TweekProps>(mapping);

    Object.values(mapping).forEach(key => expect(prepareMock).toHaveBeenCalledWith(key));

    const EnhancedComponent = enhance(Child);
    const component = renderer.create(<EnhancedComponent someProp={expectedProps.someProp} />);

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
    await repository.useStore(
      new MemoryStore({
        single_key: cachedKey('initial.singleKey'),
        'scan_key/a': cachedKey('initial.scanKey.a'),
        'scan_key/b': cachedKey('initial.scanKey.b'),
        missing_key: missingKey,
        'scan_key/_': scanKey,
      }),
    );

    const enhance = withTweekValues<TweekProps>(mapping);

    Object.values(mapping).forEach(key => expect(prepareMock).toHaveBeenCalledWith(key));

    const EnhancedComponent = enhance(Child);
    const component = renderer.create(<EnhancedComponent />);

    await repository.useStore(
      new MemoryStore({
        single_key: cachedKey(expectedProps.singleKey),
        'scan_key/a': cachedKey(expectedProps.scanKey.a),
        'scan_key/b': cachedKey(expectedProps.scanKey.b),
      }),
    );

    const child = component.root.findByType(Child);

    expect(child.props).toEqual(expectedProps);
  });

  test('unsubscribe when unloads', () => {
    const unsubscribe = jest.fn();
    const mockRepository = createMockRepository(unsubscribe);
    const enhance = withTweekValues<TweekProps>(mapping);

    const EnhancedComponent = enhance(Child);
    const component = renderer.create(
      <TweekContext.Provider value={mockRepository}>
        <EnhancedComponent />
      </TweekContext.Provider>,
    );
    component.unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  test('adds default values on initial render', () => {
    const expectedProps: TweekProps = {
      singleKey: 'single value',
      scanKey: {
        a: 'a scan value',
        b: 'b scan value',
      },
      missingKey: 'missing value default',
    };

    const enhance = withTweekValues(mapping, { defaultValues: expectedProps });
    const EnhancedComponent = enhance(Child);
    const component = renderer.create(<EnhancedComponent />);
    const child = component.root.findByType(Child);

    expect(child.props).toEqual(expectedProps);
  });

  test('adds default value if prop is missing', async () => {
    const defaultValues: TweekProps = {
      singleKey: 'a',
      scanKey: {},
      missingKey: 'missing value default',
    };
    const expectedProps = {
      singleKey: 'single value',
      scanKey: {
        a: 'a scan value',
        b: 'b scan value',
      },
      missingKey: defaultValues.missingKey,
    };
    await repository.useStore(
      new MemoryStore({
        single_key: cachedKey(expectedProps.singleKey),
        'scan_key/a': cachedKey(expectedProps.scanKey.a),
        'scan_key/b': cachedKey(expectedProps.scanKey.b),
        missing_key: missingKey,
        'scan_key/_': scanKey,
      }),
    );

    const enhance = withTweekValues(mapping, { defaultValues });

    const EnhancedComponent = enhance(Child);
    const component = renderer.create(<EnhancedComponent />);

    const child = component.root.findByType(Child);

    expect(child.props).toEqual(expectedProps);
  });

  test('unsubscribe and resubscribe when changing repository', () => {
    const unsubscribe = jest.fn();
    const listen = jest.fn();
    const enhance = withTweekValues<TweekProps>(mapping);

    const EnhancedComponent = enhance(Child);

    const render = () => (
      <TweekContext.Provider value={createMockRepository(unsubscribe, listen)}>
        <EnhancedComponent />
      </TweekContext.Provider>
    );

    const component = renderer.create(render());
    expect(listen).toHaveBeenCalledTimes(1);
    expect(unsubscribe).not.toHaveBeenCalled();

    listen.mockClear();

    component.update(render());

    expect(listen).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

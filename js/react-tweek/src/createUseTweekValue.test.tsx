import React, { Context, useContext } from 'react';
import { MemoryStore, RepositoryKeyState, TweekRepository } from 'tweek-local-cache';
import { createUseTweekValue, UseTweekValue } from './createUseTweekValue';
import renderer, { act, ReactTestRenderer } from 'react-test-renderer';

type Props = {
  value: string;
};
const Empty = (_: Props) => null;

const createMockRepository = (unsubscribe = jest.fn(), listen = jest.fn()): any => ({
  listen: listen.mockReturnValue(unsubscribe),
  getCached: jest.fn(),
  prepare: jest.fn(),
});

describe('createUseTweekValue', () => {
  const keyPath = 'some/key/path';
  const defaultValue = 'some default value';
  let repository: TweekRepository;
  let TweekContext: Context<TweekRepository>;
  let prepareMock: jest.Mock;
  let useTweekValue: UseTweekValue;

  const Component = () => {
    const value = useTweekValue(keyPath, defaultValue);
    return <Empty value={value} />;
  };

  beforeEach(() => {
    repository = new TweekRepository({ client: {} as any });
    TweekContext = React.createContext(repository);
    prepareMock = jest.fn();
    useTweekValue = createUseTweekValue(() => useContext(TweekContext), prepareMock);
  });

  test('prepares key and returns default value if key is not prepared', () => {
    const mockRepository = createMockRepository();

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <TweekContext.Provider value={mockRepository}>
          <Component />
        </TweekContext.Provider>,
      );
    });

    const child = component!.root.findByType(Empty);

    expect(child.props).toEqual({ value: defaultValue });
    expect(mockRepository.prepare).toHaveBeenCalledWith(keyPath);
  });

  test('returns default value if key is requested', async () => {
    await repository.useStore(new MemoryStore({ [keyPath]: { state: RepositoryKeyState.requested, isScan: false } }));

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(<Component />);
    });

    const child = component!.root.findByType(Empty);

    expect(child.props).toEqual({ value: defaultValue });
  });

  test('returns default value if key is missing', async () => {
    await repository.useStore(new MemoryStore({ [keyPath]: { state: RepositoryKeyState.missing, isScan: false } }));

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(<Component />);
    });

    const child = component!.root.findByType(Empty);

    expect(child.props).toEqual({ value: defaultValue });
  });

  test('returns cached value', () => {
    const value = 'some cached value';
    repository.addKeys({ [keyPath]: value });

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(<Component />);
    });

    const child = component!.root.findByType(Empty);

    expect(child.props).toEqual({ value });
  });

  test('renders changes', () => {
    repository.addKeys({ [keyPath]: 'first value' });

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(<Component />);
    });

    const value = 'second value';

    act(() => {
      repository.addKeys({ [keyPath]: value });
    });

    const child = component!.root.findByType(Empty);

    expect(child.props).toEqual({ value });
  });

  test('unsubscribe when unloads', () => {
    const unsubscribe = jest.fn();
    const mockRepository = createMockRepository(unsubscribe);

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <TweekContext.Provider value={mockRepository}>
          <Component />
        </TweekContext.Provider>,
      );
    });

    act(() => {
      component.unmount();
    });

    expect(unsubscribe).toHaveBeenCalled();
  });

  test('unsubscribe and resubscribe when changing repository', () => {
    const unsubscribe = jest.fn();
    const listen = jest.fn();

    const render = () => (
      <TweekContext.Provider value={createMockRepository(unsubscribe, listen)}>
        <Component />
      </TweekContext.Provider>
    );

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(render());
    });

    expect(listen).toHaveBeenCalledTimes(1);
    expect(unsubscribe).not.toHaveBeenCalled();

    listen.mockClear();

    act(() => {
      component.update(render());
    });

    expect(listen).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  test('create prepared hook', () => {
    const value = 'some cached value';
    repository.addKeys({ [keyPath]: value });

    const useValue = useTweekValue.create(keyPath, defaultValue);

    expect(prepareMock).toHaveBeenCalledWith(keyPath);

    const Component = () => {
      const value = useValue();
      return <Empty value={value} />;
    };

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(<Component />);
    });

    const child = component!.root.findByType(Empty);

    expect(child.props).toEqual({ value });
  });
});

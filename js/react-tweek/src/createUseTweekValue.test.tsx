import React, { Context } from 'react';
import { MemoryStore, RepositoryKeyState, TweekRepository } from 'tweek-local-cache';
import { createUseTweekValue, UseTweekValue } from './createUseTweekValue';
import renderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { OptionalTweekRepository } from './types';

type Props = {
  value: string;
};
const Empty = (_: Props) => null;

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
    useTweekValue = createUseTweekValue(TweekContext as Context<OptionalTweekRepository>, prepareMock);
  });

  test('prepares key and returns default value if key is not prepared', () => {
    const prepare = jest.spyOn(repository, 'prepare');

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(<Component />);
    });

    const child = component!.root.findByType(Empty);

    expect(child.props).toEqual({ value: defaultValue });
    expect(prepare).toHaveBeenCalledWith(keyPath);
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
    jest.spyOn(repository, 'listen').mockReturnValue(unsubscribe);

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(<Component />);
    });

    act(() => {
      component.unmount();
    });

    expect(unsubscribe).toHaveBeenCalled();
  });

  test('unsubscribe and resubscribe when changing repository', () => {
    const unsubscribe = jest.fn();
    let listen: jest.Mock;

    const render = () => {
      const repository = new TweekRepository({ client: {} as any });
      listen = jest.spyOn(repository, 'listen').mockReturnValue(unsubscribe);
      return (
        <TweekContext.Provider value={repository}>
          <Component />
        </TweekContext.Provider>
      );
    };

    let component: ReactTestRenderer;
    act(() => {
      component = renderer.create(render());
    });

    expect(listen!).toHaveBeenCalledTimes(1);
    expect(unsubscribe).not.toHaveBeenCalled();

    act(() => {
      component.update(render());
    });

    expect(listen!).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  test('value from the hook should equal the value from the repository when changing the repository', () => {
    const firstCachedValue = 'Jake the Dog';
    const secondCachedValue = 'Finn the Human';

    let values: { valueFromHook: string; valueFromRepo: string }[] = [];

    const Component = ({ repository }: { repository: TweekRepository }) => {
      const value = useTweekValue(keyPath, defaultValue);
      values.push({ valueFromHook: value, valueFromRepo: repository.getCached(keyPath)!.value });
      return <Empty value={value} />;
    };

    const render = (value: string) => {
      const repository = new TweekRepository({ client: {} as any });
      repository.addKeys({ [keyPath]: value });
      return (
        <TweekContext.Provider value={repository}>
          <Component repository={repository} />
        </TweekContext.Provider>
      );
    };

    let testRenderer: ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(render(firstCachedValue));
    });
    act(() => testRenderer.update(render(secondCachedValue)));
    values.forEach(({ valueFromHook, valueFromRepo }) => expect(valueFromHook).toEqual(valueFromRepo));
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

import React, { Context, Reducer } from 'react';
import isEqual from 'lodash.isequal';
import { RepositoryKeyState } from 'tweek-local-cache';
import { OptionalTweekRepository, PrepareKey } from './types';
import { ensureHooks } from './utils';

export interface UseTweekValue {
  <T>(keyPath: string, defaultValue: T): T;
  create: <T>(keyPath: string, defaultValue: T) => () => T;
}

function valueReducer<T>(prevValue: T, nextValue: T) {
  // to bail out of dispatching
  // if the values are equal we should return previous value for reference equality in objects
  // relevant for scan keys only
  // https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-dispatch
  if (isEqual(prevValue, nextValue)) {
    return prevValue;
  }

  return nextValue;
}

function getValueOrDefault<T>(keyPath: string, tweekRepository: OptionalTweekRepository, defaultValue: T) {
  if (!tweekRepository) {
    return defaultValue;
  }

  const cached = tweekRepository.getCached(keyPath);
  if (!cached) {
    tweekRepository.prepare(keyPath);
    return defaultValue;
  }

  return cached.state === RepositoryKeyState.cached ? cached.value : defaultValue;
}

export const createUseTweekValue = (
  TweekContext: Context<OptionalTweekRepository>,
  prepare: PrepareKey,
): UseTweekValue => {
  function useTweekValue<T>(keyPath: string, defaultValue: T): T {
    ensureHooks();

    const tweekRepository = React.useContext(TweekContext);
    const [tweekValue, setTweekValue] = React.useReducer<Reducer<T, T>>(valueReducer, defaultValue);

    React.useEffect(() => {
      const updateValue = () => setTweekValue(getValueOrDefault(keyPath, tweekRepository, defaultValue));
      updateValue();
      return tweekRepository && tweekRepository.listen(updateValue);
    }, [tweekRepository, keyPath, defaultValue]);

    return tweekValue;
  }

  useTweekValue.create = <T>(keyPath: string, defaultValue: T) => {
    prepare(keyPath);
    return () => useTweekValue(keyPath, defaultValue);
  };

  return useTweekValue;
};

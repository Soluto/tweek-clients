import React from 'react';
import isEqual from 'lodash.isequal';
import { RepositoryKeyState } from 'tweek-local-cache';
import { PrepareKey, UseTweekRepository } from './types';

export interface UseTweekValue {
  <T>(keyPath: string, defaultValue: T): T;
  create: <T>(keyPath: string, defaultValue: T) => () => T;
}

function valueReducer<T>(prevValue: T, nextValue: T) {
  if (isEqual(prevValue, nextValue)) {
    return prevValue;
  }

  return nextValue;
}

export const createUseTweekValue = (useTweekRepository: UseTweekRepository, prepare: PrepareKey): UseTweekValue => {
  function useTweekValue<T = any>(keyPath: string, defaultValue: T): T {
    const tweekRepository = useTweekRepository();
    const [tweekValue, setTweekValue] = React.useReducer(valueReducer, defaultValue);

    const getValue = () => {
      if (!tweekRepository) {
        return defaultValue;
      }

      const cached = tweekRepository.getCached(keyPath);
      if (!cached) {
        tweekRepository.prepare(keyPath);
        return defaultValue;
      }

      return cached.state === RepositoryKeyState.cached ? cached.value : defaultValue;
    };

    const updateValue = () => setTweekValue(getValue());

    React.useEffect(updateValue, [keyPath]);

    React.useEffect(() => {
      updateValue();
      return tweekRepository && tweekRepository.listen(updateValue);
    }, [tweekRepository]);

    return tweekValue;
  }

  useTweekValue.create = <T>(keyPath: string, defaultValue: T) => {
    prepare(keyPath);
    return () => useTweekValue(keyPath, defaultValue);
  };

  return useTweekValue;
};

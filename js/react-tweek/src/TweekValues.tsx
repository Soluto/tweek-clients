import { Component, ReactElement } from 'react';
import { RepositoryKeyState, Unlisten } from 'tweek-local-cache';
import isEqual from 'lodash.isequal';
import { OptionalTweekRepository } from './types';

type Values = { [s: string]: any };

export type ResetOptions = {
  resetOnRepoChange?: boolean;
};

export type ValuesMapping<T> = Record<keyof T, string>;

export type TweekValuesProps<T extends {}> = ResetOptions & {
  tweekRepository: OptionalTweekRepository;
  valuesMapping: ValuesMapping<T>;
  defaultValues?: T;
  children: (values: T) => ReactElement<any> | null;
};

function filterDefaultValues<T>(keyMapping: ValuesMapping<T>, defaultValues: T | undefined): T | null {
  if (!defaultValues) {
    return null;
  }

  const defaultState: Values = {};
  Object.keys(keyMapping).forEach(prop => (defaultState[prop] = (defaultValues as Values)[prop]));
  return defaultState as T;
}

function extractTweekValues<T>(
  { valuesMapping, tweekRepository, defaultValues, resetOnRepoChange }: TweekValuesProps<T>,
  currentValues: T | null,
): T | null {
  const filteredDefaultValues = filterDefaultValues(valuesMapping, defaultValues);

  if (!tweekRepository) {
    return resetOnRepoChange || !currentValues ? filteredDefaultValues : currentValues;
  }

  const newValues: Values = filteredDefaultValues || {};

  for (const [prop, keyPath] of Object.entries(valuesMapping as Values)) {
    const cachedKey = tweekRepository.getCached(keyPath);

    if (!cachedKey) {
      tweekRepository.prepare(keyPath);
    }

    if (cachedKey && cachedKey.state !== RepositoryKeyState.requested) {
      if (cachedKey.state !== RepositoryKeyState.missing) {
        newValues[prop] = cachedKey.value;
      }
    } else if (!filteredDefaultValues) {
      if (resetOnRepoChange || !currentValues) {
        return null;
      }
      newValues[prop] = (currentValues as Values)[prop];
    }
  }

  return newValues as T;
}

type TweekValuesState<T> = {
  tweekValues: T | null;
};

export class TweekValues<T> extends Component<TweekValuesProps<T>, TweekValuesState<T>> {
  state: TweekValuesState<T>;
  private _dispose: Unlisten | null = null;

  constructor(props: TweekValuesProps<T>) {
    super(props);

    this.state = { tweekValues: extractTweekValues(props, null) };
    this._subscribeToKeys();
  }

  componentDidUpdate(prevProps: TweekValuesProps<T>) {
    if (prevProps.tweekRepository !== this.props.tweekRepository) {
      this._unsubscribe();
      this._subscribeToKeys();
      this._setKeysState();
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  private _subscribeToKeys() {
    const { tweekRepository } = this.props;
    if (!tweekRepository) {
      return;
    }

    this._dispose = tweekRepository.listen(this._setKeysState);
  }

  private _unsubscribe() {
    this._dispose && this._dispose();
    this._dispose = null;
  }

  private _setKeysState = () => {
    this.setState(({ tweekValues: currentValues }, props) => {
      const tweekValues = extractTweekValues(props, currentValues);
      return isEqual(tweekValues, currentValues) ? null : { tweekValues };
    });
  };

  render() {
    const { tweekValues } = this.state;
    if (!tweekValues) {
      return null;
    }

    return this.props.children(tweekValues);
  }
}

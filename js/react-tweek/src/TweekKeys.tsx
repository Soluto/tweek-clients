import { Component, ReactElement } from 'react';
import { RepositoryKeyState, TweekRepository, Unlisten } from 'tweek-local-cache';
import isEqual from 'lodash.isequal';
import { WithTweekKeysOptions } from './withTweekKeysFactory';

type TweekValues = { [s: string]: any };

export type ResetOptions = {
  resetOnRepoChange?: boolean;
};

export type KeyMapping<T> = Record<keyof T, string>;

export type TweekKeysProps<T extends {}> = WithTweekKeysOptions<T> & {
  tweekRepository: TweekRepository | undefined;
  keyMapping: KeyMapping<T>;
  children: (values: T) => ReactElement<any> | null;
};

function filterDefaultValues<T>(keyMapping: KeyMapping<T>, defaultValues: T | undefined): T | null {
  if (!defaultValues) {
    return null;
  }

  const defaultState: TweekValues = {};
  Object.keys(keyMapping).forEach(prop => (defaultState[prop] = (defaultValues as TweekValues)[prop]));
  return defaultState as T;
}

function extractTweekValues<T>(
  { keyMapping, tweekRepository, defaultValues, resetOnRepoChange }: TweekKeysProps<T>,
  currentValues: T | null,
): T | null {
  const filteredDefaultValues = filterDefaultValues(keyMapping, defaultValues);

  if (!tweekRepository) {
    return resetOnRepoChange || !currentValues ? filteredDefaultValues : currentValues;
  }

  const newValues: TweekValues = filteredDefaultValues || {};

  for (const [prop, keyPath] of Object.entries(keyMapping as TweekValues)) {
    const cachedKey = tweekRepository.getCached(keyPath);

    if (cachedKey && cachedKey.state !== RepositoryKeyState.requested) {
      if (cachedKey.state !== RepositoryKeyState.missing) {
        newValues[prop] = cachedKey.value;
      }
    } else if (!filteredDefaultValues) {
      if (resetOnRepoChange || !currentValues) {
        return null;
      }
      newValues[prop] = (currentValues as TweekValues)[prop];
    }
  }

  return newValues as T;
}

type TweekKeysState<T> = {
  tweekValues: T | null;
};

export class TweekKeys<T> extends Component<TweekKeysProps<T>, TweekKeysState<T>> {
  state: TweekKeysState<T>;
  private _dispose: Unlisten | null = null;

  constructor(props: TweekKeysProps<T>) {
    super(props);

    this.state = { tweekValues: extractTweekValues(props, null) };
    this._subscribeToKeys();
  }

  componentDidUpdate(prevProps: TweekKeysProps<T>) {
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
    const { tweekRepository, keyMapping } = this.props;
    if (!tweekRepository) {
      return;
    }

    this._dispose = tweekRepository.listen(this._setKeysState);
    (Object.values(keyMapping) as string[]).forEach(k => tweekRepository.prepare(k));
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

import React, { Component, ComponentType, Context } from 'react';
import { RepositoryKeyState, TweekRepository, Unlisten } from 'tweek-local-cache';
import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';
import { ComponentEnhancer } from './typeUtils';

type TweekValues = { [s: string]: any };

export type WithTweekKeysOptions<T = TweekValues> = {
  defaultValues?: Partial<T>;
  resetOnRepoChange?: boolean;
};

export type WithTweekKeysProps = {
  resetOnRepoChange?: boolean;
};

export type KeyPropsMapping = { [propName: string]: string };

export interface WithTweekKeys {
  (keyPropsMapping: KeyPropsMapping, options?: WithTweekKeysOptions): (
    BaseComponent: ComponentType<any>,
  ) => ComponentType<any>;
  <TTweekProps>(
    keyPropsMapping: Record<keyof TTweekProps, string>,
    options?: WithTweekKeysOptions<TTweekProps>,
  ): ComponentEnhancer<TTweekProps, WithTweekKeysProps>;
}

type WithTweekKeysState = { tweekValues: null | TweekValues };
type WithTweekKeysRepoProps = WithTweekKeysProps & {
  _tweekRepo?: TweekRepository;
  _keyPropsMapping: KeyPropsMapping;
  _baseComponent: ComponentType<any>;
  _defaultValues?: TweekValues;
};

const filterDefaultValues = (keyPropsMapping: KeyPropsMapping, defaultValues: TweekValues | undefined) => {
  if (!defaultValues) {
    return null;
  }

  const defaultState: TweekValues = {};
  Object.keys(keyPropsMapping).forEach(prop => (defaultState[prop] = defaultValues[prop]));
  return defaultState;
};

const extractTweekValues = (
  { _keyPropsMapping, _tweekRepo, _defaultValues, resetOnRepoChange }: WithTweekKeysRepoProps,
  currentValues: TweekValues | null,
) => {
  const defaultValues = filterDefaultValues(_keyPropsMapping, _defaultValues);

  if (!_tweekRepo) {
    return resetOnRepoChange || !currentValues ? defaultValues : currentValues;
  }

  const newValues: null | TweekValues = defaultValues || {};

  for (const [prop, keyPath] of Object.entries(_keyPropsMapping)) {
    const cachedKey = _tweekRepo.getCached(keyPath);

    if (cachedKey && cachedKey.state !== RepositoryKeyState.requested) {
      if (cachedKey.state !== RepositoryKeyState.missing) {
        newValues[prop] = cachedKey.value;
      }
    } else if (!defaultValues) {
      if (resetOnRepoChange || !currentValues) {
        return null;
      }
      newValues[prop] = currentValues[prop];
    }
  }

  return newValues;
};

export class WithTweekKeysComponent extends Component<WithTweekKeysRepoProps, WithTweekKeysState> {
  static displayName = `withTweekKeys`;

  state: WithTweekKeysState;
  private _dispose: Unlisten | null = null;

  constructor(props: WithTweekKeysRepoProps) {
    super(props);
    this.state = { tweekValues: extractTweekValues(props, null) };
    this._subscribeToKeys();
  }

  componentDidUpdate(prevProps: WithTweekKeysRepoProps) {
    if (prevProps._tweekRepo !== this.props._tweekRepo) {
      this._unsubscribe();
      this._subscribeToKeys();
      this._setKeysState();
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  private _subscribeToKeys() {
    const { _tweekRepo } = this.props;
    if (!_tweekRepo) {
      return;
    }

    this._dispose = _tweekRepo.listen(this._setKeysState);
  }

  private _unsubscribe() {
    this._dispose && this._dispose();
    this._dispose = null;
  }

  private _setKeysState = () => {
    this.setState(({ tweekValues: currentValues }, props) => {
      const tweekValues = extractTweekValues(props, currentValues);
      if (isEqual(tweekValues, currentValues)) {
        return null;
      }
      return { tweekValues };
    });
  };

  render() {
    const { tweekValues } = this.state;
    if (!tweekValues) {
      return null;
    }

    const { _baseComponent: BaseComponent } = this.props;
    return (
      <BaseComponent
        {...omit(this.props, '_tweekRepo', '_keyPropsMapping', '_baseComponent', '_defaultValues', 'resetOnRepoChange')}
        {...tweekValues}
      />
    );
  }
}

export default (TweekContext: Context<TweekRepository | undefined>, prepare: (key: string) => void): WithTweekKeys =>
  function(keyPropsMapping: { [s: string]: string }, { defaultValues, resetOnRepoChange }: WithTweekKeysOptions = {}) {
    Object.values(keyPropsMapping).forEach(key => prepare(key));

    return (BaseComponent: ComponentType<any>) => {
      return (props: WithTweekKeysProps) => (
        <TweekContext.Consumer>
          {repo => (
            <WithTweekKeysComponent
              _tweekRepo={repo}
              _baseComponent={BaseComponent}
              _keyPropsMapping={keyPropsMapping}
              _defaultValues={defaultValues}
              {...props}
              resetOnRepoChange={props.resetOnRepoChange === undefined ? resetOnRepoChange : props.resetOnRepoChange}
            />
          )}
        </TweekContext.Consumer>
      );
    };
  };

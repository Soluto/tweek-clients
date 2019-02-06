import React, { Component, ComponentType, Context } from 'react';
import { RepositoryKeyState, TweekRepository } from 'tweek-local-cache';
import { Unlisten } from 'change-emitter';
import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';
import { ComponentEnhancer } from './typeUtils';

export type WithTweekKeysOptions<T = { [s: string]: any }> = {
  defaultValues?: Partial<T>;
  resetOnRepoChange?: boolean;
};

export type WithTweekKeysProps = {
  resetOnRepoChange?: boolean;
};

export interface WithTweekKeys {
  (keyPropsMapping: { [propName: string]: string }, options?: WithTweekKeysOptions): (
    BaseComponent: ComponentType<any>,
  ) => ComponentType<any>;
  <TTweekProps>(
    keyPropsMapping: Record<keyof TTweekProps, string>,
    options?: WithTweekKeysOptions<TTweekProps>,
  ): ComponentEnhancer<TTweekProps, WithTweekKeysProps>;
}

type TweekValues = { [s: string]: any };
type WithTweekKeysState = { tweekValues: null | TweekValues };
type WithTweekKeysRepoProps = WithTweekKeysProps & {
  _tweekRepo?: TweekRepository;
  _keyPropsMapping: { [s: string]: string };
  _baseComponent: ComponentType<any>;
  _defaultValues?: { [s: string]: any };
};

export class WithTweekKeysComponent extends Component<WithTweekKeysRepoProps, WithTweekKeysState> {
  static displayName = `withTweekKeys`;

  state: WithTweekKeysState;
  private _dispose: Unlisten | null = null;

  constructor(props: WithTweekKeysRepoProps) {
    super(props);
    this.state = { tweekValues: this._getDefaultState() };
  }

  componentDidMount() {
    this._subscribeToKeys();
  }

  componentDidUpdate(prevProps: WithTweekKeysRepoProps) {
    if (prevProps._tweekRepo !== this.props._tweekRepo) {
      this._unsubscribe();
      this._subscribeToKeys();
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
    this._setKeysState();
  }

  private _unsubscribe() {
    this._dispose && this._dispose();
    this._dispose = null;
  }

  private _getDefaultState() {
    const { _defaultValues, _keyPropsMapping } = this.props;
    if (!_defaultValues) {
      return null;
    }

    const defaultState: TweekValues = {};
    Object.keys(_keyPropsMapping).forEach(prop => (defaultState[prop] = _defaultValues[prop]));
    return defaultState;
  }

  private _setKeysState = () => {
    const { _keyPropsMapping, _tweekRepo, resetOnRepoChange } = this.props;
    if (!_tweekRepo) {
      return;
    }

    const { tweekValues: currentValues } = this.state;
    const defaultValues = this._getDefaultState();
    const newValues: TweekValues = defaultValues || {};

    for (const [prop, keyPath] of Object.entries(_keyPropsMapping)) {
      const cachedKey = _tweekRepo.getCached(keyPath);

      if (cachedKey && cachedKey.state !== RepositoryKeyState.requested) {
        if (cachedKey.state !== RepositoryKeyState.missing) {
          newValues[prop] = cachedKey.value;
        }
      } else if (!defaultValues) {
        if (resetOnRepoChange || !currentValues) {
          this._safeSetState(null);
          return;
        }
        newValues[prop] = currentValues[prop];
      }
    }

    this._safeSetState(newValues);
  };

  private _safeSetState(tweekValues: null | TweekValues) {
    this.setState(state => {
      if (isEqual(state.tweekValues, tweekValues)) {
        return null;
      }
      return { tweekValues };
    });
  }

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

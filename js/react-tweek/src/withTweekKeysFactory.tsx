import React, { Component, ComponentType, Context } from 'react';
import { TweekRepository } from 'tweek-local-cache';
import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';
import { ComponentEnhancer } from './typeUtils';

export type WithTweekKeysOptions<T = { [s: string]: any }> = {
  onError?: (error: Error) => void;
  defaultValues?: Partial<T>;
  resetOnRepoChange?: boolean;
};

export type WithTweekKeysProps = {
  resetOnRepoChange?: boolean;
};

export interface WithTweekKeys {
  (keyPropsMapping: { [s: string]: string }, options?: WithTweekKeysOptions): (
    BaseComponent: ComponentType<any>,
  ) => ComponentType<any>;
  <TTweekProps>(
    keyPropsMapping: Record<keyof TTweekProps, string>,
    options?: WithTweekKeysOptions<TTweekProps>,
  ): ComponentEnhancer<TTweekProps, WithTweekKeysProps>;
}

type WithTweekKeysState = { [s: string]: any };
type WithTweekKeysRepoProps = WithTweekKeysProps & {
  _tweekRepo?: TweekRepository;
  _keyPropsMapping: { [s: string]: string };
  _onError?: (e: Error) => void;
  _baseComponent: ComponentType<any>;
  _defaultValues?: { [s: string]: any };
};

export class WithTweekKeysComponent extends Component<WithTweekKeysRepoProps, WithTweekKeysState> {
  static displayName = `withTweekKeys`;

  state: WithTweekKeysState;
  private _subscriptions: ZenObservable.Subscription[] = [];

  constructor(props: WithTweekKeysRepoProps) {
    super(props);
    this.state = this._getDefaultState();
    this._subscribeToKeys();
  }

  componentDidUpdate(prevProps: WithTweekKeysRepoProps) {
    if (prevProps._tweekRepo !== this.props._tweekRepo) {
      this._unsubscribe();
      if (this.props.resetOnRepoChange) {
        this.setState(this._getDefaultState());
      }
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

    this._subscriptions = Object.entries(this.props._keyPropsMapping).map(([propName, path]) => {
      const isScanKey = path.split('/').pop() === '_';
      return _tweekRepo.observe(path).subscribe(
        result => {
          this.setState(state => {
            if (!isScanKey) {
              if (result.hasValue) {
                result = result.value;
              } else {
                const { _defaultValues: { [propName]: value = null } = {} } = this.props;
                result = value;
              }
            }
            if (isEqual(state[propName], result)) {
              return null;
            }
            return { [propName]: result };
          });
        },
        error => {
          const { _onError = console.error } = this.props;
          _onError(error);
          this._unsubscribe();
        },
      );
    });
  }

  private _unsubscribe() {
    this._subscriptions.forEach(x => x.unsubscribe());
    this._subscriptions = [];
  }

  private _shouldRender() {
    return Object.keys(this.props._keyPropsMapping).every(key => this.state[key] !== undefined);
  }

  private _getDefaultState() {
    const { _defaultValues = {} } = this.props;
    return Object.keys(this.props._keyPropsMapping).reduce(
      (acc, prop) => ({ ...acc, [prop]: _defaultValues[prop] }),
      {},
    );
  }

  render() {
    const shouldRender = this._shouldRender();
    if (!shouldRender) {
      return null;
    }

    const { _baseComponent: BaseComponent } = this.props;
    return (
      <BaseComponent
        {...this.state}
        {...omit(
          this.props,
          '_tweekRepo',
          '_keyPropsMapping',
          '_onError',
          '_baseComponent',
          '_defaultValues',
          'resetOnRepoChange',
        )}
      />
    );
  }
}

export default (TweekContext: Context<TweekRepository | undefined>, prepare: (key: string) => void): WithTweekKeys =>
  function(
    keyPropsMapping: { [s: string]: string },
    { onError, defaultValues, resetOnRepoChange }: WithTweekKeysOptions = {},
  ) {
    Object.values(keyPropsMapping).forEach(key => prepare(key));

    return (BaseComponent: ComponentType<any>) => {
      return (props: WithTweekKeysProps) => (
        <TweekContext.Consumer>
          {repo => (
            <WithTweekKeysComponent
              _tweekRepo={repo}
              _baseComponent={BaseComponent}
              _onError={onError}
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

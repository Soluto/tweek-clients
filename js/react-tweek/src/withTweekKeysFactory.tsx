import React, { Component, ComponentType, Context } from 'react';
import { GetPolicy, NotPreparedPolicy, TweekRepository } from 'tweek-local-cache';
import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';
import { ComponentEnhancer } from './typeUtils';

export type WithTweekKeysOptions = {
  onError?: (error: Error) => void;
  getPolicy?: GetPolicy;
}

export interface WithTweekKeys {
  (keyPropsMapping: {[s: string]: string}, options?: WithTweekKeysOptions): (BaseComponent: ComponentType<any>) => ComponentType<any>
  <TTweekProps>(keyPropsMapping: Record<keyof TTweekProps, string>, options?: WithTweekKeysOptions): ComponentEnhancer<TTweekProps>
}

type WithTweekKeysState = { [s: string]: any };
type WithTweekKeysRepoProps = {
  _tweekRepo: TweekRepository;
  _keyPropsMapping: { [s: string]: string };
  _onError?: (e: Error) => void;
  _getPolicy?: GetPolicy;
  _baseComponent: ComponentType<any>;
};

export class WithTweekKeysComponent extends Component<WithTweekKeysRepoProps, WithTweekKeysState> {
  static displayName = `withTweekKeys`;

  state: WithTweekKeysState = {};
  private _subscriptions: ZenObservable.Subscription[] = [];

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
    this._subscriptions = Object.entries(this.props._keyPropsMapping).map(([propName, path]) => {
      const isScanKey = path.split('/').pop() === '_';
      return this.props._tweekRepo.observe(path, this.props._getPolicy).subscribe(
        result => {
          this.setState((state) => {
            if (!isScanKey) {
              result = result.hasValue ? result.value : null;
            }
            if (isEqual(state[propName], result)) {
              return null;
            }
            return { [propName]: result };
          });
        },
        error => {
          if (this.props._onError) this.props._onError(error);
          else console.error(error);
          this._unsubscribe();
        },
      );
    });
  }

  private _unsubscribe() {
    this._subscriptions.forEach(x => x.unsubscribe());
    this._subscriptions = [];
  };

  private _shouldRender() {
    return Object.keys(this.props._keyPropsMapping).every((key) => this.state[key] !== undefined);
  }

  render() {
    const shouldRender = this._shouldRender();
    if (!shouldRender) {
      return null;
    }

    const {_baseComponent: BaseComponent} = this.props;
    return <BaseComponent {...this.state} {...omit(this.props, '_tweekRepo', '_keyPropsMapping', '_onError', '_getPolicy', '_baseComponent')} />;
  }
}

export default (TweekContext: Context<TweekRepository>, prepare: (key: string) => void): WithTweekKeys =>
  function (
    keyPropsMapping: {[s: string]: string},
    { getPolicy, onError }: WithTweekKeysOptions = {}
  ) {
    if (!getPolicy || getPolicy.notPrepared === NotPreparedPolicy.prepare) {
      Object.values(keyPropsMapping).forEach(key => prepare(key));
    }

    return (BaseComponent: ComponentType<any>) => {
      return (props: {}) => (
        <TweekContext.Consumer>
          {(repo) => <WithTweekKeysComponent _tweekRepo={repo} _baseComponent={BaseComponent} _onError={onError} _getPolicy={getPolicy} _keyPropsMapping={keyPropsMapping} {...props}/>}
        </TweekContext.Consumer>
      );
    };
  }

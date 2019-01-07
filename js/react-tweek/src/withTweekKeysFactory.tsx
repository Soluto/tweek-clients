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
type WithTweekKeysRepoProps = { _tweekRepo: TweekRepository };

export default (TweekContext: Context<TweekRepository>, prepare: (key: string) => void): WithTweekKeys =>
  function (
    keyPropsMapping: {[s: string]: string},
    { getPolicy, onError }: WithTweekKeysOptions = {}
  ) {
    if (!getPolicy || getPolicy.notPrepared === NotPreparedPolicy.prepare) {
      Object.values(keyPropsMapping).forEach(key => prepare(key));
    }

    return (BaseComponent: ComponentType<any>) => {
      class WithTweekKeys extends Component<WithTweekKeysRepoProps, WithTweekKeysState> {
        static displayName = `withTweekKeys(${BaseComponent.displayName || BaseComponent.name || 'Component'})`;

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
          this._subscriptions = Object.entries(keyPropsMapping as { [s: string]: string }).map(([propName, path]) => {
            const isScanKey = path.split('/').pop() === '_';
            return this.props._tweekRepo.observe(path, getPolicy).subscribe(
              result => {
                this.setState((state) => {
                  if (!isScanKey) {
                    result = result.value;
                  }
                  if (isEqual(state[propName], result)) {
                    return null;
                  }
                  return { [propName]: result };
                });
              },
              error => {
                if (onError) onError(error);
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
          return Object.keys(keyPropsMapping).every((key) => this.state[key] !== undefined);
        }

        render() {
          const shouldRender = this._shouldRender();
          if (!shouldRender) {
            return null;
          }

          return <BaseComponent {...this.state} {...omit(this.props, '_tweekRepo')} />;
        }
      }

      return (props: {}) => (
        <TweekContext.Consumer>
          {(repo) => <WithTweekKeys _tweekRepo={repo} {...props}/>}
        </TweekContext.Consumer>
      );
    };
  }

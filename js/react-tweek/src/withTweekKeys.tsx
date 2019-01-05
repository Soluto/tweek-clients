import React, { Component, ComponentType } from 'react';
import { camelize } from 'humps';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import { GetPolicy } from 'tweek-local-cache';

type Omit<T extends U, U> = Pick<T, Exclude<keyof T, keyof U>>;

export type WithTweekKeysOptions = {
  mergeProps?: boolean;
  propName?: string;
  onError?: (error: Error) => void;
  repoKey?: string;
  getPolicy?: GetPolicy
  once?: boolean;
  initialValue?: any;
}

export default function<TTweekProps extends object>(
  path: string,
  { mergeProps = true, propName, onError, repoKey = 'tweekRepo', getPolicy, once, initialValue }: WithTweekKeysOptions = {},
) {

  type State = {
    tweekProps?: TTweekProps;
  }

  return <TProps extends TTweekProps>(EnhancedComponent: ComponentType<TProps>) => {
    type Props = Omit<TProps, TTweekProps>;

    const isScanKey = path.split('/').pop() === '_';

    return class extends Component<Props, State> {
      // @ts-ignore TS2339
      static displayName = `withTweekKeys(${EnhancedComponent.displayName || EnhancedComponent.name || 'Component'})`;
      static contextTypes = {
        [repoKey]: PropTypes.object,
      };

      state: State = { tweekProps: undefined };
      subscription: ZenObservable.Subscription | null = null;

      componentWillMount() {
        if (initialValue !== undefined) {
          this.setTweekValue(isScanKey ? initialValue : { value: initialValue });
        }

        this.subscription = this.context[repoKey].observe(path, getPolicy).subscribe(
          (result: any) => {
            this.setTweekValue(result);
            if (once) {
              this.unsubscribe();
            }
          },
          (error: Error) => {
            if (onError) onError(error);
            else console.error(error);
            this.unsubscribe();
          },
        );
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      unsubscribe() {
        this.subscription && this.subscription.unsubscribe();
        this.subscription = null;
      }

      setTweekValue = (result: any = {}) => {
        let tweekProps: any;

        if (isScanKey) {
          tweekProps = mergeProps ? result : { [propName || 'tweek']: result };
        } else {
          const configName = path.split('/').pop();
          tweekProps = mergeProps
            ? { [propName || camelize(configName!)]: result.value }
            : { [propName || 'tweek']: { [camelize(configName!)]: result.value } };
        }

        this.setState((state) => {
          if (isEqual(state.tweekProps, tweekProps)) {
            return null;
          }
          return { tweekProps };
        })
      };

      render() {
        if (!this.state.tweekProps) {
          return null;
        }

        const props = {...this.props, ...this.state.tweekProps} as TProps;
        return  <EnhancedComponent {...props} />;
      }
    };
  };
}
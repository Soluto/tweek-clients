import React, { Context, FunctionComponent, ReactType } from 'react';
import { TweekRepository } from 'tweek-local-cache';
import { getDisplayName, Omit } from './utils';
import { KeyMapping, ResetOptions, TweekKeys } from './TweekKeys';

export type WithTweekKeysOptions<T> = ResetOptions & {
  defaultValues?: T;
};

export type WithTweekKeys = <T>(
  keyPropsMapping: KeyMapping<T>,
  options?: WithTweekKeysOptions<T>,
) => <TProps extends T>(BaseComponent: ReactType<TProps>) => FunctionComponent<Omit<TProps, T> & ResetOptions>;

export const withTweekKeysFactory = (
  TweekContext: Context<TweekRepository | undefined>,
  prepare: (key: string) => void,
): WithTweekKeys =>
  function<T>(
    keyPropsMapping: KeyMapping<T>,
    { defaultValues, resetOnRepoChange: staticResetOnRepoChange }: WithTweekKeysOptions<T> = {},
  ) {
    (Object.values(keyPropsMapping) as string[]).forEach(key => prepare(key));

    return <TProps extends T>(BaseComponent: ReactType<TProps>) => {
      const EnhancedComponent: FunctionComponent<Omit<TProps, T> & ResetOptions> = ({
        resetOnRepoChange = staticResetOnRepoChange,
        ...props
      }) => (
        <TweekContext.Consumer>
          {repo => (
            <TweekKeys
              tweekRepository={repo}
              keyMapping={keyPropsMapping}
              defaultValues={defaultValues}
              resetOnRepoChange={resetOnRepoChange}
            >
              {values => {
                // @ts-ignore
                return <BaseComponent {...props} {...values} />;
              }}
            </TweekKeys>
          )}
        </TweekContext.Consumer>
      );

      EnhancedComponent.displayName = `withTweekKeys(${getDisplayName(BaseComponent)})`;

      return EnhancedComponent;
    };
  };

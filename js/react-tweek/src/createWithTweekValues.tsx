import React, { Context, ElementType, FunctionComponent } from 'react';
import { getDisplayName } from './utils';
import { ValuesMapping, ResetOptions, TweekValues } from './TweekValues';
import { Omit, OptionalTweekRepository, PrepareKey } from './types';

export type WithTweekValuesOptions<T> = ResetOptions & {
  defaultValues?: T;
};

export type WithTweekValues = <T>(
  valuesMapping: ValuesMapping<T>,
  options?: WithTweekValuesOptions<T>,
) => <TProps extends T>(BaseComponent: ElementType<TProps>) => FunctionComponent<Omit<TProps, T> & ResetOptions>;

export const createWithTweekValues = (
  TweekContext: Context<OptionalTweekRepository>,
  prepare: PrepareKey,
): WithTweekValues =>
  function<T>(
    valuesMapping: ValuesMapping<T>,
    { defaultValues, resetOnRepoChange: staticResetOnRepoChange }: WithTweekValuesOptions<T> = {},
  ) {
    (Object.values(valuesMapping) as string[]).forEach(key => prepare(key));

    return <TProps extends T>(BaseComponent: ElementType<TProps>) => {
      const EnhancedComponent: FunctionComponent<Omit<TProps, T> & ResetOptions> = ({
        resetOnRepoChange = staticResetOnRepoChange,
        ...props
      }) => (
        <TweekContext.Consumer>
          {repo => (
            <TweekValues
              tweekRepository={repo}
              valuesMapping={valuesMapping}
              defaultValues={defaultValues}
              resetOnRepoChange={resetOnRepoChange}
            >
              {values => {
                // @ts-ignore
                return <BaseComponent {...props} {...values} />;
              }}
            </TweekValues>
          )}
        </TweekContext.Consumer>
      );

      EnhancedComponent.displayName = `withTweekValues(${getDisplayName(BaseComponent)})`;

      return EnhancedComponent;
    };
  };

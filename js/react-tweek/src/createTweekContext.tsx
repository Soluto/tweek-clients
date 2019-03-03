import React, { Component, ComponentType, Consumer, ProviderProps } from 'react';
import { createChangeEmitter, Unlisten } from 'change-emitter';
import { TweekRepository } from 'tweek-local-cache';
import { createWithTweekValues, WithTweekValues } from './createWithTweekValues';
import { OptionalTweekRepository, PrepareKey, UseTweekRepository } from './types';
import { createUseTweekValue, UseTweekValue } from './createUseTweekValue';
import { ensureHooks } from './utils';

export type TweekContext = {
  Provider: ComponentType<ProviderProps<OptionalTweekRepository>>;
  Consumer: Consumer<OptionalTweekRepository>;
  prepareKey: PrepareKey;
  withTweekValues: WithTweekValues;
  useTweekRepository: UseTweekRepository;
  useTweekValue: UseTweekValue;
};

export const createTweekContext = (defaultRepo?: TweekRepository): TweekContext => {
  const keysToPrepare: string[] = [];
  const emitter = createChangeEmitter<string>();
  emitter.listen(key => {
    defaultRepo && defaultRepo.prepare(key);
    keysToPrepare.push(key);
  });

  const TweekContext = React.createContext(defaultRepo);
  TweekContext.displayName = 'TweekContext';

  class Provider extends Component<ProviderProps<OptionalTweekRepository>> {
    private readonly dispose: Unlisten;

    constructor(props: ProviderProps<OptionalTweekRepository>) {
      super(props);
      keysToPrepare.forEach(this.prepare);
      this.dispose = emitter.listen(this.prepare);
    }

    componentDidUpdate(prevProps: Readonly<React.ProviderProps<TweekRepository>>) {
      if (this.props.value !== prevProps.value) {
        keysToPrepare.forEach(this.prepare);
      }
    }

    componentWillUnmount() {
      this.dispose();
    }

    private prepare = (key: string) => {
      const { value } = this.props;
      value && value.prepare(key);
    };

    render() {
      return <TweekContext.Provider {...this.props} />;
    }
  }

  function useTweekRepository() {
    ensureHooks();
    return React.useContext(TweekContext);
  }

  return {
    Provider,
    Consumer: TweekContext.Consumer,
    prepareKey: emitter.emit,
    withTweekValues: createWithTweekValues(TweekContext, emitter.emit),
    useTweekRepository,
    useTweekValue: createUseTweekValue(TweekContext, emitter.emit),
  };
};

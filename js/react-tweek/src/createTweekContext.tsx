import React, { Component, ComponentType, Consumer, ProviderProps } from 'react';
import { createChangeEmitter, Unlisten } from 'change-emitter';
import { TweekRepository } from 'tweek-local-cache';
import { createWithTweekValues, WithTweekValues } from './createWithTweekValues';

export type TweekContext = {
  Provider: ComponentType<ProviderProps<TweekRepository | undefined>>;
  Consumer: Consumer<TweekRepository | undefined>;
  prepare(key: string): void;
  withTweekValues: WithTweekValues;
};

export default (defaultRepo?: TweekRepository): TweekContext => {
  const keysToPrepare: string[] = [];
  const emitter = createChangeEmitter<string>();
  emitter.listen(key => {
    defaultRepo && defaultRepo.prepare(key);
    keysToPrepare.push(key);
  });

  const TweekContext = React.createContext(defaultRepo);
  TweekContext.displayName = 'TweekContext';

  class Provider extends Component<ProviderProps<TweekRepository | undefined>> {
    private dispose: Unlisten;

    constructor(props: ProviderProps<TweekRepository | undefined>) {
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

  return {
    Provider,
    Consumer: TweekContext.Consumer,
    prepare: emitter.emit,
    withTweekValues: createWithTweekValues(TweekContext, emitter.emit),
  };
};

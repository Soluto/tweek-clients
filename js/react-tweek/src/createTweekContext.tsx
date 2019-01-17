import React, { Component, ComponentType, Consumer, ProviderProps } from 'react';
import { createChangeEmitter, Unlisten } from 'change-emitter';
import { TweekRepository } from 'tweek-local-cache';
import withTweekKeysFactory, { WithTweekKeys } from './withTweekKeysFactory';

export type TweekContext = {
  Provider: ComponentType<ProviderProps<TweekRepository>>;
  Consumer: Consumer<TweekRepository>;
  prepare(key: string): void;
  withTweekKeys: WithTweekKeys;
};

export default (defaultRepo: TweekRepository): TweekContext => {
  const keysToPrepare: string[] = [];
  const emitter = createChangeEmitter<string>();
  emitter.listen(key => {
    defaultRepo.prepare(key);
    keysToPrepare.push(key);
  });

  const TweekContext = React.createContext(defaultRepo);
  TweekContext.displayName = 'TweekContext';

  class Provider extends Component<ProviderProps<TweekRepository>> {
    private dispose: Unlisten | null = null;

    componentDidMount() {
      keysToPrepare.forEach(this.prepare);
      this.dispose = emitter.listen(this.prepare);
    }

    componentDidUpdate(prevProps: Readonly<React.ProviderProps<TweekRepository>>) {
      if (this.props.value !== prevProps.value) {
        keysToPrepare.forEach(this.prepare);
      }
    }

    componentWillUnmount() {
      this.dispose && this.dispose();
    }

    private prepare = (key: string) => {
      this.props.value.prepare(key);
    };

    render() {
      return <TweekContext.Provider {...this.props} />;
    }
  }

  return {
    Provider,
    Consumer: TweekContext.Consumer,
    prepare: emitter.emit,
    withTweekKeys: withTweekKeysFactory(TweekContext, emitter.emit),
  };
};

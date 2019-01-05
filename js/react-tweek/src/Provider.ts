import { Component, Children } from 'react';
import PropTypes from 'prop-types';
import { TweekRepository } from 'tweek-local-cache';
import { TweekClient } from 'tweek-client';

export type ProviderProps = {
  repo?: TweekRepository;
  client?: TweekClient;
  baseServiceUrl?: string;
};

export function createProvider({ repoKey = 'tweekRepo' } = {}) {
  return class extends Component<ProviderProps> {
    static displayName = 'Provider';

    static childContextTypes = {
      [repoKey]: PropTypes.object,
    };

    getChildContext = () => ({ [repoKey]: this.tweekRepo });

    readonly tweekRepo: TweekRepository;

    constructor(props: ProviderProps, context: any) {
      super(props, context);

      let { repo, client, baseServiceUrl } = props;

      if (repo) {
        this.tweekRepo = repo;
      } else {
        if (!client) {
          const { createTweekClient } = require('tweek-client');
          client = createTweekClient({ baseServiceUrl });
        }
        const TweekLocalCache = require('tweek-local-cache').default;
        this.tweekRepo = new TweekLocalCache({ client });
      }
    }

    render() {
      return Children.only(this.props.children);
    }
  };
}

export default createProvider();

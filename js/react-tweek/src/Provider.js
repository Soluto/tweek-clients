import { Component, Children } from 'react';
import repoPropType from './repoPropType';

export function createProvider({ repoKey = 'repo' } = {}) {
  return class extends Component {
    static displayName = 'Provider';

    static childContextTypes = {
      [repoKey]: repoPropType,
    };

    getChildContext = () => ({ [repoKey]: this.repo });

    constructor(props, context) {
      super(props, context);

      let { repo, client, baseServiceUrl } = props;

      if (repo) {
        this.repo = repo;
      } else {
        if (!client) {
          const { createTweekClient } = require('tweek-client');
          client = createTweekClient({ baseServiceUrl });
        }
        const TweekLocalCache = require('tweek-local-cache').default;
        this.repo = new TweekLocalCache({ client });
      }
    }

    render() {
      return Children.only(this.props.children);
    }
  };
}

export default createProvider();

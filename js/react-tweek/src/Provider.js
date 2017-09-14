import { Component, Children } from 'react';
import { createTweekClient } from 'tweek-client';
import TweekLocalCache from 'tweek-local-cache';
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
        client = client || createTweekClient({ baseServiceUrl });
        this.repo = new TweekLocalCache({ client });
      }
    }

    render() {
      return Children.only(this.props.children);
    }
  };
}

export default createProvider();

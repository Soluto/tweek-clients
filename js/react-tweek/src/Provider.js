import { Component, Children } from 'react';
import PropTypes from 'prop-types';

export function createProvider({ repoKey = 'tweekRepo' } = {}) {
  return class extends Component {
    static displayName = 'Provider';

    static childContextTypes = {
      [repoKey]: PropTypes.object,
    };

    getChildContext = () => ({ [repoKey]: this.tweekRepo });

    constructor(props, context) {
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

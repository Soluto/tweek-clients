import React, { Component } from 'react';
import { camelize } from 'humps';
import repoPropType from './repoPropType';

export default function(path, { mergeProps = true, propName, onError, repoKey = 'repo', getPolicy } = {}) {
  return function(EnhancedComponent) {
    return class extends Component {
      static displayName = `withTweekKeys(${EnhancedComponent.displayName || EnhancedComponent.name || 'Component'})`;
      static contextTypes = {
        [repoKey]: repoPropType,
      };

      state = {};

      componentWillMount() {
        return this.context[repoKey]
          .get(path, getPolicy)
          .catch(error => {
            if (onError) return onError(error);
            console.error(error);
          })
          .then((result = {}) => {
            let tweekProps;

            if (path.split('/').pop() === '_') {
              tweekProps = mergeProps ? result : { [propName || 'tweek']: result };
            } else {
              const configName = path.split('/').pop();
              tweekProps = mergeProps
                ? { [propName || camelize(configName)]: result.value }
                : { [propName || 'tweek']: { [camelize(configName)]: result.value } };
            }
            this.setState({ tweekProps });
          });
      }

      render() {
        return this.state.tweekProps ? <EnhancedComponent {...this.props} {...this.state.tweekProps} /> : null;
      }
    };
  };
}

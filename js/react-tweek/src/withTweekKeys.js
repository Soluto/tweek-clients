import React, { Component } from 'react';
import { camelize } from 'humps';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';

export default (
  path,
  { mergeProps = true, propName, onError, repoKey = 'tweekRepo', getPolicy, once, initialValue } = {},
) => EnhancedComponent => {
  const isScanKey = path.split('/').pop() === '_';

  return class extends Component {
    static displayName = `withTweekKeys(${EnhancedComponent.displayName || EnhancedComponent.name || 'Component'})`;
    static contextTypes = {
      [repoKey]: PropTypes.object,
    };

    state = {};

    componentWillMount() {
      if (initialValue !== undefined) {
        this.setTweekValue(isScanKey ? initialValue : { value: initialValue });
      }

      this.subscription = this.context[repoKey].observe(path, getPolicy).subscribe(
        result => {
          this.setTweekValue(result);
          if (once) {
            this.unsubscribe();
          }
        },
        error => {
          if (onError) onError(error);
          else console.error(error);
          this.unsubscribe();
        },
      );
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    unsubscribe() {
      this.subscription && this.subscription.unsubscribe();
      this.subscription = null;
    }

    setTweekValue = (result = {}) => {
      let tweekProps;

      if (isScanKey) {
        tweekProps = mergeProps ? result : { [propName || 'tweek']: result };
      } else {
        const configName = path.split('/').pop();
        tweekProps = mergeProps
          ? { [propName || camelize(configName)]: result.value }
          : { [propName || 'tweek']: { [camelize(configName)]: result.value } };
      }
      this.setState({ tweekProps });
    };

    shouldComponentUpdate(nextProps, nextState) {
      return !isEqual(this.props, nextProps) || !isEqual(this.state.tweekProps, nextState.tweekProps);
    }

    render() {
      return this.state.tweekProps ? <EnhancedComponent {...this.props} {...this.state.tweekProps} /> : null;
    }
  };
};

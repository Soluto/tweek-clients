import React, { Component } from 'react';
import { camelize } from 'humps';

const prepareRequests = [];
let globalTweekRepository = null;

export const withTweekKeys = (path, {mergeProps = true, propName} = {}) => {
    if (globalTweekRepository) {
        globalTweekRepository.prepare(path);
    }
    else {
        prepareRequests.push(path);
    }

    return (EnhancedComponent) => class extends Component {
        constructor() {
            super();
            this.state = {};
        }

        componentWillMount() {
			if (!globalTweekRepository) throw Error("Global Tweek Repository is not initialized. Did you remember to use the 'connect' method?");
            const promise = globalTweekRepository.get(path);
            if (path.split('/').pop() === "_") {
                promise.then(result => {
                    if (mergeProps) {
                        this.setState({ tweekProps: result });
                    } else {
                        this.setState({ tweekProps: { [propName || "tweek"]: result } });
                    }
                });
            }
            else {
                const configName = path.split('/').pop();
                promise.then(result => {
                    if (mergeProps) {
                        this.setState({ tweekProps: { [propName || camelize(configName)]: result.value } });
                    } else {
                        this.setState({ tweekProps: { [propName || "tweek"]: { [camelize(configName)]: result.value } } });
                    }
                });
            }
        }

        render() {
            return this.state.tweekProps ? <EnhancedComponent {...this.props} {...this.state.tweekProps} /> : null;
        }
    }
};

export function connect(tweekRepository) {
    globalTweekRepository = tweekRepository;
    prepareRequests.forEach(r => globalTweekRepository.prepare(r));
}
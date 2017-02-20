import React, { Component } from 'react';
import { camelize } from 'humps';

const prepareRequests = [];
let globalTweekRepository = null;

export const withTweekKeys = (path) => {
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
            const promise = globalTweekRepository.get(path);
            if (path.split('/').pop() === "_") {
                promise.then(result => this.setState({ tweekProps: result }));
            }
            else {
                const propName = path.split('/').pop();
                promise.then(result => this.setState({ tweekProps: { [camelize(propName)]: result.value } }));
            }
        }

        render() {
            return <EnhancedComponent {...this.props} {...this.state.tweekProps} />;
        }
    }
};

export function connect(tweekRepository) {
    globalTweekRepository = tweekRepository;
    prepareRequests.forEach(r => globalTweekRepository.prepare(r))
    return globalTweekRepository.refresh();
}
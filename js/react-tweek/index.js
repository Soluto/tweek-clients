
import React, {Component} from 'react';

const prepareRequests = [];
let globalTweekRepository = null;

export const mapTweekToProps = (path, mapToProps = tweekResult => tweekResult) => {
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
          globalTweekRepository.get(path)
            .then(tweekResult => {console.log(tweekResult); return tweekResult;})
            .then(tweekResult => mapToProps(tweekResult))
            .then(tweekProps => this.setState({tweekProps}));
      }

      render() {
          return <EnhancedComponent {...this.props} {...this.state.tweekProps} />;
      }
    }
};

export function connect(tweekRepository){
    globalTweekRepository = tweekRepository;
    prepareRequests.forEach(r => globalTweekRepository.prepare(r))
    return globalTweekRepository.refresh();
}
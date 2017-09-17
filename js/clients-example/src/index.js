import React from 'react';
import ReactDOM from 'react-dom';
import { withTweekKeys, Provider } from 'react-tweek';
import './index.css';

const WithKey = withTweekKeys('some/string')(({ string }) => <div>{string}</div>);

const App = () => (
  <Provider baseServiceUrl="http://localhost:4003">
    <div>
      text text text
      <WithKey />
    </div>
  </Provider>
);

ReactDOM.render(<App />, document.getElementById('root'));

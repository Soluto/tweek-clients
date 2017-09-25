import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-tweek';
import ThemeProvider from './ThemeProvider';
import App from './App';
import './index.css';

ReactDOM.render(
  <Provider baseServiceUrl="http://localhost:4003">
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById('root'),
);

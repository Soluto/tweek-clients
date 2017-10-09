import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-tweek';
import { createTweekClient, watchVersion } from 'tweek-client';
import TweekLocalCache from 'tweek-local-cache';
import ThemeProvider from './ThemeProvider';
import App from './App';
import './index.css';

const baseServiceUrl = 'http://localhost:1111';

const tweekClient = createTweekClient({ baseServiceUrl });
const repo = new TweekLocalCache({ client: tweekClient });

const watcher = watchVersion(baseServiceUrl);
watcher.subscribe(() => repo.refresh());

ReactDOM.render(
  <Provider repo={repo}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById('root'),
);

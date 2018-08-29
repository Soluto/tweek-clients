import * as qs from 'query-string';
import { convertTypingFromJSON, snakeToCamelCase } from './utils';
import { FetchConfig, ITweekClient, TweekInitConfig } from './types';
import chunk = require('lodash.chunk');

export default class TweekClient implements ITweekClient {
  config: TweekInitConfig;

  private static ENCODE_$_CHARACTER = encodeURIComponent('$');
  private static ENCODE_SLASH_CHARACTER = encodeURIComponent('/');

  constructor(config: TweekInitConfig) {
    this.config = <TweekInitConfig & FetchConfig>{
      ...{ casing: 'snake', flatten: false, convertTyping: false, context: {}, ignoreKeyTypes: false },
      ...config,
    };

    let { baseServiceUrl } = config;

    if (baseServiceUrl.endsWith('/')) {
      baseServiceUrl = baseServiceUrl.substr(0, baseServiceUrl.length - 1);
      this.config.baseServiceUrl = baseServiceUrl;
    }
  }

  private fetchChunk<T>(path: string, _config: TweekInitConfig & FetchConfig): Promise<T> {
    const { casing, flatten, baseServiceUrl, convertTyping, context, include, ignoreKeyTypes, onError } = _config;

    const queryParamsObject = this._contextToQueryParams(context);

    if (flatten) {
      queryParamsObject['$flatten'] = true;
    }

    if (ignoreKeyTypes) {
      queryParamsObject['$ignoreKeyTypes'] = true;
    }

    queryParamsObject['$include'] = include;
    const queryString = qs.stringify(queryParamsObject);
    const encodedQueryString = this.queryParamsEncoder(queryString);

    const url =
      baseServiceUrl +
      '/api/v1/keys' +
      (path.startsWith('/') ? '' : '/') +
      path +
      (!!encodedQueryString ? `?${encodedQueryString}` : '');

    let result: Promise<any> = this.config.fetch(url).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        const error = new Error(response.statusText);
        onError && setImmediate(() => onError(error));
        return Promise.reject(error);
      }
    });

    if (!flatten && casing === 'camelCase') {
      result = result.then(snakeToCamelCase);
    }

    if (convertTyping) {
      result = result.then(convertTypingFromJSON);
    }

    return <Promise<T>>result;
  }

  fetch<T>(path: string, _config: FetchConfig = {}): Promise<T> {
    const cfg = <TweekInitConfig & FetchConfig>{
      ...this.config,
      ..._config,
    };
    if (!_config.include) {
      return this.fetchChunk(path, cfg);
    }

    const { include, maxChunkSize = 100 } = cfg;

    const includeChunks = chunk(include, maxChunkSize);
    const fetchConfigChunks = includeChunks.map(ic => ({ ...cfg, include: ic }));
    const fetchPromises = fetchConfigChunks.map(cc => this.fetchChunk(path, cc));
    const result = Promise.all(fetchPromises).then(chunks => chunks.reduce((res, ch) => ({ ...res, ...ch }), {}));
    return <Promise<T>>result;
  }

  appendContext(identityType: string, identityId: string, context: object): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v1/context/${identityType}/${identityId}`;
    const result = this.config
      .fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error appending context, code ${response.status}, message: '${response.statusText}'`);
        }
      });
    return <Promise<void>>result;
  }

  deleteContext(identityType: string, identityId: string, property: string): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v1/context/${identityType}/${identityId}/${property}`;
    const result = this.config.fetch(url, { method: 'DELETE' }).then(response => {
      if (!response.ok) {
        throw new Error(`Error deleting context property, code ${response.status}, message: '${response.statusText}'`);
      }
    });
    return <Promise<void>>result;
  }

  public queryParamsEncoder = (queryParams: string) =>
    queryParams.replace(/\$/g, TweekClient.ENCODE_$_CHARACTER).replace(/\//g, TweekClient.ENCODE_SLASH_CHARACTER);

  private _contextToQueryParams = context => {
    return Object.keys(context).reduce((pre, cur) => {
      const identityContext = context[cur];
      Object.keys(identityContext).forEach(
        x => (x === 'id' ? (pre[`${cur}`] = identityContext[x]) : (pre[`${cur}.${x}`] = identityContext[x])),
      );
      return pre;
    }, {});
  };
}

import { InputParams } from 'query-string';
import chunk from 'lodash.chunk';
import { normalizeBaseUrl, optimizeInclude, toQueryString } from '../utils';
import { TweekInitConfig } from '../types';
import { FetchError } from '../FetchError';
import { Context, GetValuesConfig, TweekClientConfig } from './types';

export * from './types';

export interface ITweekClient {
  getValues<T>(path: string, config?: GetValuesConfig): Promise<T>;

  /**
   * @deprecated use `getValues` instead
   */
  fetch<T>(path: string, config?: GetValuesConfig): Promise<T>;
}

export class TweekClient implements ITweekClient {
  config: TweekClientConfig;
  private readonly _endpoint: string;

  constructor(config: TweekClientConfig, useLegacyEndpoint?: boolean) {
    this.config = {
      context: {},
      ...config,
    };

    this.config.baseServiceUrl = normalizeBaseUrl(config.baseServiceUrl);
    this._endpoint = useLegacyEndpoint ? '/api/v1/keys/' : '/api/v2/values/';
  }

  getValues<T>(path: string, _config: GetValuesConfig = {}): Promise<T> {
    const cfg = <TweekInitConfig & GetValuesConfig>{
      ...this.config,
      ..._config,
    };

    const { include, maxChunkSize = 100 } = cfg;

    if (!include) {
      return this._fetchChunk(path, cfg);
    }

    const optimizedInclude = optimizeInclude(include);
    const includeChunks = chunk(optimizedInclude, maxChunkSize);
    const fetchConfigChunks = includeChunks.map(ic => ({ ...cfg, include: ic }));
    const fetchPromises = fetchConfigChunks.map(cc => this._fetchChunk(path, cc));
    return <Promise<T>>Promise.all(fetchPromises).then(chunks => chunks.reduce((res, ch) => ({ ...res, ...ch }), {}));
  }

  fetch = this.getValues;

  private _fetchChunk<T>(path: string, _config: TweekInitConfig & GetValuesConfig): Promise<T> {
    const { flatten, baseServiceUrl, context, include, ignoreKeyTypes } = _config;

    const queryParamsObject = this._contextToQueryParams(context);

    if (flatten) {
      queryParamsObject['$flatten'] = true;
    }

    if (ignoreKeyTypes) {
      queryParamsObject['$ignoreKeyTypes'] = true;
    }

    queryParamsObject['$include'] = include;

    const queryString = toQueryString(queryParamsObject);

    const url = `${baseServiceUrl}${this._endpoint}${path}${queryString}`;

    return this.config.fetch(url).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(new FetchError(response, 'Error getting values from tweek'));
      }
    });
  }

  private _contextToQueryParams = (context: Context | undefined): InputParams => {
    if (!context) {
      return {};
    }

    return Object.keys(context).reduce((pre: InputParams, cur) => {
      let identityContext = context[cur];

      if (typeof identityContext === 'string') {
        identityContext = { id: identityContext };
      }

      Object.entries(identityContext).forEach(([key, value]) => (pre[key === 'id' ? cur : `${cur}.${key}`] = value));
      return pre;
    }, {});
  };
}

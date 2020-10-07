import chunk from 'lodash.chunk';
import { FetchError } from '../FetchError';
import { TweekInitConfig } from '../types';
import { InputParams, normalizeBaseUrl, normalizeKeyPath, optimizeInclude, toQueryString } from '../utils';
import { Context, DetailedTweekResult, GetValuesConfig, ITweekClient, TweekClientConfig } from './types';

export default class TweekClient implements ITweekClient {
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

  getValues<T>(path: string, config?: GetValuesConfig): Promise<T> {
    return this._splitToChunks<T>(path, config, false).then((res) => res.data);
  }

  getValuesWithDetails<T>(path: string, config?: GetValuesConfig): Promise<DetailedTweekResult<T>> {
    return this._splitToChunks<T>(path, config, true);
  }

  private _splitToChunks<T>(
    path: string,
    _config: GetValuesConfig = {},
    includeErrors: boolean,
  ): Promise<DetailedTweekResult<T>> {
    const cfg = <TweekInitConfig & GetValuesConfig>{
      ...this.config,
      ..._config,
    };

    const { include, maxChunkSize = 100 } = cfg;

    if (!include) {
      return this._fetchChunk<T>(path, cfg, includeErrors);
    }

    const optimizedInclude = optimizeInclude(include);
    const includeChunks = chunk(optimizedInclude, maxChunkSize);
    const fetchConfigChunks = includeChunks.map((ic) => ({ ...cfg, include: ic }));
    const fetchPromises = fetchConfigChunks.map((cc) => this._fetchChunk<T>(path, cc, includeErrors));
    return Promise.all(fetchPromises).then((chunks) => {
      return chunks.reduce((res, ch) => ({
        data: { ...res.data, ...ch.data },
        errors: { ...res.errors, ...ch.errors },
      }));
    });
  }

  private _fetchChunk<T>(
    path: string,
    _config: TweekInitConfig & GetValuesConfig,
    includeErrors: boolean,
  ): Promise<DetailedTweekResult<T>> {
    const { flatten, baseServiceUrl, context, include, ignoreKeyTypes } = _config;

    const queryParamsObject = this._contextToQueryParams(context);

    if (includeErrors) {
      queryParamsObject['$includeErrors'] = true;
    }

    if (flatten) {
      queryParamsObject['$flatten'] = true;
    }

    if (ignoreKeyTypes) {
      queryParamsObject['$ignoreKeyTypes'] = true;
    }

    queryParamsObject['$include'] = include;

    const queryString = toQueryString(queryParamsObject);

    const url = `${baseServiceUrl}${this._endpoint}${normalizeKeyPath(path)}${queryString}`;

    return this.config.fetch(url).then((response) => {
      if (response.ok) {
        const result = response.json();
        if (includeErrors) {
          return result;
        }
        return result.then((data) => ({ data }));
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

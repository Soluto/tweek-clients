import { InputParams } from 'query-string';
import chunk from 'lodash.chunk';
import { deprecated, normalizeBaseUrl, optimizeInclude, toQueryString } from '../utils';
import { TweekInitConfig } from '../types';
import { FetchError } from '../FetchError';
import {
  Context,
  GetValuesConfig,
  ITweekClient,
  KeyValuesErrorHandler,
  KeyValuesErrors,
  TweekClientConfig,
} from './types';
import { KeyValuesError } from './KeyValuesError';

type TweekResult<T> = {
  data: T;
  errors: KeyValuesErrors;
};

function extractData<T>(
  { data, errors }: TweekResult<T>,
  throwOnError: boolean | undefined,
  onKeyValueError: KeyValuesErrorHandler | undefined,
) {
  if (errors && Object.keys(errors).length > 0) {
    if (onKeyValueError) {
      Object.entries(errors as KeyValuesErrors).forEach(([k, e]) => onKeyValueError(k, e));
    }
    if (throwOnError) {
      throw new KeyValuesError(errors, 'Tweek values had errors');
    }
  }
  return data;
}

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

  getValues<T>(path: string, _config: GetValuesConfig = {}): Promise<T> {
    const cfg = <TweekInitConfig & GetValuesConfig>{
      ...this.config,
      ..._config,
    };

    const { include, maxChunkSize = 100, throwOnError, onKeyValueError } = cfg;

    if (!include) {
      return this._fetchChunk<T>(path, cfg).then(res => extractData(res, throwOnError, onKeyValueError));
    }

    const optimizedInclude = optimizeInclude(include);
    const includeChunks = chunk(optimizedInclude, maxChunkSize);
    const fetchConfigChunks = includeChunks.map(ic => ({ ...cfg, include: ic }));
    const fetchPromises = fetchConfigChunks.map(cc => this._fetchChunk<T>(path, cc));
    return Promise.all(fetchPromises).then(chunks => {
      const res = chunks.reduce((res, ch) => ({
        data: { ...res.data, ...ch.data },
        errors: { ...res.errors, ...ch.errors },
      }));
      return extractData(res, throwOnError, onKeyValueError);
    });
  }

  @deprecated('getValues')
  fetch<T>(path: string, config?: GetValuesConfig): Promise<T> {
    return this.getValues(path, config);
  }

  private _fetchChunk<T>(path: string, _config: TweekInitConfig & GetValuesConfig): Promise<TweekResult<T>> {
    const { flatten, baseServiceUrl, context, include, ignoreKeyTypes, throwOnError, onKeyValueError } = _config;

    const includeErrors = Boolean(throwOnError || onKeyValueError);

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

    const url = `${baseServiceUrl}${this._endpoint}${path}${queryString}`;

    return this.config.fetch(url).then(response => {
      if (response.ok) {
        const result = response.json();
        if (includeErrors) {
          return result;
        }
        return result.then(data => ({ data }));
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

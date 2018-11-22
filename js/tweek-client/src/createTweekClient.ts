import TweekClient from './TweekClient';
import { createFetchWithTimeout } from './utils';
import crossFetch = require('cross-fetch');

const globalFetch = crossFetch.fetch;

export type DeprecatedConfig = {
  /**
   * @deprecated use `url` instead
   */
  baseServiceUrl: string;
};

function isDeprecatedConfig(obj: any): obj is DeprecatedConfig {
  return Boolean(obj.baseServiceUrl);
}

export type UrlConfig =
  | DeprecatedConfig
  | {
      url: string | string[];
    };

export type CreateTweekClientConfig = UrlConfig & {
  context?: any;
  requestTimeoutInMillis?: number;
  getAuthenticationToken?: () => Promise<string> | string;
  clientName?: string;
  fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  onError?(error: Error): void;
};

export default function(config: CreateTweekClientConfig) {
  const {
    fetch = globalFetch,
    context = {},
    getAuthenticationToken,
    requestTimeoutInMillis = 8000,
    onError,
    clientName,
  } = config;

  const urls = isDeprecatedConfig(config) ? config.baseServiceUrl : config.url;

  const fetchClient = async (input, init: RequestInit = {}) => {
    return fetch(input, {
      ...init,
      headers: {
        ...init.headers,
        ['X-Api-Client']: clientName || 'unknown',
        ...getAuthenticationToken ? { Authorization: `Bearer ${await Promise.resolve(getAuthenticationToken())}` } : {},
      },
    });
  };

  return new TweekClient({
    urls: Array.isArray(urls) ? urls : [urls],
    casing: 'camelCase',
    convertTyping: false,
    context,
    fetch: createFetchWithTimeout(requestTimeoutInMillis, fetchClient),
    onError,
  });
}

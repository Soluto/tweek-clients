import TweekClient from './TweekClient';
import { createFetchWithTimeout } from './utils';
import crossFetch = require('cross-fetch');
const globalFetch = crossFetch.fetch;

export default function(config: {
  baseServiceUrl: string;
  fallbackUrls?: string[];
  context?: any;
  requestTimeoutInMillis?: number;
  getAuthenticationToken?: () => Promise<string> | string;
  clientName?: string;
  fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  onError?(error: Error): void;
}) {
  const {
    baseServiceUrl,
    fallbackUrls,
    fetch = globalFetch,
    context = {},
    getAuthenticationToken,
    requestTimeoutInMillis = 8000,
    onError,
    clientName,
  } = config;

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
    baseServiceUrl,
    fallbackUrls,
    casing: 'camelCase',
    convertTyping: false,
    context,
    fetch: createFetchWithTimeout(requestTimeoutInMillis, fetchClient),
    onError,
  });
}

import TweekClient from './TweekClient';
import { createFetchWithTimeout } from './utils';
import crossFetch = require('cross-fetch');
const Response = crossFetch.Response;
const globalFetch = crossFetch.fetch;

export default function(config: {
  baseServiceUrl: string;
  context?: any;
  requestTimeoutInMillis?: number;
  getAuthenticationToken?: () => Promise<string> | string;
  fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  onError?(error: Error): void;
}) {
  const {
    baseServiceUrl,
    fetch = globalFetch,
    context = {},
    getAuthenticationToken,
    requestTimeoutInMillis = 8000,
    onError,
  } = config;

  let fetchClient = fetch;
  if (getAuthenticationToken) {
    fetchClient = async (input, init: any = {}) => {
      const token = await Promise.resolve(getAuthenticationToken());
      return fetch(input, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    };
  }

  return new TweekClient({
    baseServiceUrl,
    casing: 'camelCase',
    convertTyping: false,
    context,
    fetch: createFetchWithTimeout(requestTimeoutInMillis, fetchClient),
    onError,
  });
}

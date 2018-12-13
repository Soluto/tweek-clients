import TweekClient from './TweekClient';
import { createFetchWithTimeout } from './utils';
import { default as globalFetch } from 'cross-fetch';
import { CreateTweekClientConfig } from './types';

export default function({
  baseServiceUrl,
  fetch = globalFetch,
  context = {},
  getAuthenticationToken,
  requestTimeoutInMillis = 8000,
  onError,
  clientName,
}: CreateTweekClientConfig) {
  const fetchClient = async (input, init: any = {}) => {
    return fetch(input, {
      ...init,
      headers: {
        ...init.headers,
        ['X-Api-Client']: clientName || 'unknown',
        ...(getAuthenticationToken
          ? { Authorization: `Bearer ${await Promise.resolve(getAuthenticationToken())}` }
          : {}),
      },
    });
  };

  return new TweekClient({
    baseServiceUrl,
    casing: 'camelCase',
    convertTyping: false,
    context,
    fetch: createFetchWithTimeout(requestTimeoutInMillis, fetchClient),
    onError,
  });
}

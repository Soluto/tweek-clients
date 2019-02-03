import { fetch as globalFetch, Response } from 'cross-fetch';
import qs, { InputParams } from 'query-string';
import { FetchClientConfig } from './types';

const createFetchWithTimeout = (timeoutInMillis: number, fetchFn: typeof fetch): typeof fetch => (
  input: RequestInfo,
  init?: RequestInit,
) => {
  let timeout: any;

  return Promise.race([
    fetchFn(input, init),
    new Promise<Response>(res => {
      timeout = setTimeout(() => res(new Response(null, { status: 408 })), timeoutInMillis);
    }),
  ])
    .then(response => {
      if (timeout) {
        clearTimeout(timeout);
      }

      return response;
    })
    .catch(error => {
      if (timeout) {
        clearTimeout(timeout);
      }

      throw error;
    });
};

export const createFetchClient = ({
  fetch = globalFetch,
  getAuthenticationToken,
  clientId,
  clientSecret,
  requestTimeoutInMillis = 8000,
  onError,
}: FetchClientConfig) => {
  const fetchClient = (input: RequestInfo, init: RequestInit = {}) => {
    let headersPromise: Promise<Record<string, string>>;

    if (getAuthenticationToken) {
      headersPromise = Promise.resolve(getAuthenticationToken()).then(t => ({ Authorization: `Bearer ${t}` }));
    } else if (clientId && clientSecret) {
      headersPromise = Promise.resolve({ 'X-Client-Id': clientId, 'X-Client-Secret': clientSecret });
    } else {
      headersPromise = Promise.resolve({});
    }

    let fetchPromise = headersPromise.then(authHeaders =>
      fetch(input, {
        ...init,
        headers: {
          ...init.headers,
          ...authHeaders,
        },
      }),
    );

    if (onError) {
      fetchPromise = fetchPromise.then(response => {
        if (!response.ok) {
          setImmediate(() => onError(response));
        }

        return response;
      });
    }

    return fetchPromise;
  };

  if (!requestTimeoutInMillis) {
    return fetchClient;
  }

  return createFetchWithTimeout(requestTimeoutInMillis, fetchClient);
};

export function delay(timeout: number) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export const isScanKey = (key: string) => key === '_' || key.endsWith('/_');

export const optimizeInclude = (keys: string[]): string[] => {
  let count = 0,
    i = 0;
  const keysLength = keys.length;
  const result = new Array<string>(keysLength);

  keys.sort();

  const handleKey = (key: string) => {
    result[count] = key;
    count++;

    if (!isScanKey(key)) {
      return;
    }

    const prefixLength = key.length - 1;
    const prefix = key.substring(0, prefixLength);

    while (i < keysLength) {
      const nextKey = keys[i];

      if (!nextKey.startsWith(prefix)) {
        break;
      }

      i++;

      if (nextKey.includes('/@', prefixLength)) {
        handleKey(nextKey);
      }
    }
  };

  while (i < keysLength) {
    const key = keys[i];
    i++;
    handleKey(key);
  }

  result.splice(count);

  return result;
};

export const normalizeBaseUrl = (url: string) => {
  if (url.endsWith('/')) {
    url = url.substr(0, url.length - 1);
  }
  return url;
};

export const toQueryString = (query: InputParams) => {
  const queryString = qs.stringify(query);
  return queryString ? `?${queryString}` : '';
};

import { fetch as globalFetch, Response } from 'cross-fetch';
import qs from 'query-string';
import { FetchClientConfig } from './types';
import { FetchError } from './FetchError';

const createFetchWithTimeout = (timeoutInMillis: number, fetchFn: typeof fetch): typeof fetch => (
  input: RequestInfo,
  init?: RequestInit,
) => {
  let timeout: any;

  return Promise.race([
    fetchFn(input, init),
    new Promise<Response>((res) => {
      timeout = setTimeout(() => res(new Response(null, { status: 408 })), timeoutInMillis);
    }),
  ])
    .then((response) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      return response;
    })
    .catch((error) => {
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
}: FetchClientConfig): ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) => {
  const fetchClient = async (input: RequestInfo, init: RequestInit = {}) => {
    let authHeaders: Record<string, string> | undefined;

    if (getAuthenticationToken) {
      const token = await getAuthenticationToken();
      authHeaders = { Authorization: `Bearer ${token}` };
    } else if (clientId && clientSecret) {
      authHeaders = { 'X-Client-Id': clientId, 'X-Client-Secret': clientSecret };
    }

    try {
      const response = await fetch(input, {
        ...init,
        headers: {
          ...init.headers,
          ...authHeaders,
        },
      });

      if (onError && !response.ok) {
        setImmediate(() => {
          try {
            onError(new FetchError(response, 'tweek server responded with an error'));
          } catch (err) {
            onError(err);
          }
        });
      }

      return response;
    } catch (err) {
      onError && onError(err);

      throw err;
    }
  };

  if (!requestTimeoutInMillis) {
    return fetchClient;
  }

  return createFetchWithTimeout(requestTimeoutInMillis, fetchClient);
};

export function delay(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export const isScanKey = (key: string) => key === '_' || key.endsWith('/_');

export const optimizeInclude = (keys: string[]): string[] => {
  let count = 0,
    i = 0;
  const keysLength = keys.length;
  const result = new Array<string>(keysLength);

  keys = keys.map(normalizeKeyPath).sort();

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
  return url.endsWith('/') ? url.substr(0, url.length - 1) : url;
};

export const normalizeKeyPath = (keyPath: string) => {
  return keyPath.startsWith('/') ? keyPath.substr(1) : keyPath;
};

export type InputParams = Record<string, unknown>;

export const toQueryString = (query: InputParams) => {
  const queryString = qs.stringify(query);
  return queryString ? `?${queryString}` : '';
};

export function deprecated(newMethod: string) {
  let notified = false;
  return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalValue = descriptor.value;
    descriptor.value = function () {
      if (!notified) {
        if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
          const name = target.constructor.name;
          console.warn(`the ${name}.${propertyKey} method is deprecated, please use ${name}.${newMethod} instead`);
        }
        notified = true;
      }

      return originalValue.apply(this, arguments);
    };
  };
}

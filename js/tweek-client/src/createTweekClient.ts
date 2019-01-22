import { TweekClient } from './TweekClient';
import { createFetchWithTimeout } from './utils';
import { default as globalFetch } from 'cross-fetch';

export type CreateTweekClientConfig = {
  baseServiceUrl: string;
  context?: any;
  getAuthenticationToken?: () => Promise<string> | string;
  clientName?: string;
  fetch?: typeof fetch;
  requestTimeoutInMillis?: number;
  onError?(response: Response): void;
  useLegacyEndpoint?: boolean;
};

export function createTweekClient({
  baseServiceUrl,
  fetch = globalFetch,
  context = {},
  getAuthenticationToken,
  requestTimeoutInMillis = 8000,
  onError,
  clientName,
  useLegacyEndpoint,
}: CreateTweekClientConfig) {
  const fetchClient = (input: RequestInfo, init: RequestInit = {}) => {
    const headersPromise = getAuthenticationToken
      ? Promise.resolve(getAuthenticationToken()).then(t => ({ Authorization: `Bearer ${t}` }))
      : Promise.resolve({});

    let fetchPromise = headersPromise.then(authHeaders =>
      fetch(input, {
        ...init,
        headers: {
          ...init.headers,
          ['X-Api-Client']: clientName || 'unknown',
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

  return new TweekClient(
    {
      baseServiceUrl,
      context,
      fetch: createFetchWithTimeout(requestTimeoutInMillis, fetchClient),
    },
    useLegacyEndpoint,
  );
}

import { Response } from 'cross-fetch';

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const createFetchWithTimeout = (timeoutInMillis: number, fetchFn: typeof fetch): typeof fetch => (
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

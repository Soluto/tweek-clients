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

export function snakeToCamelCase(target: any) {
  if (target === null || typeof target !== 'object' || Array.isArray(target)) return target;
  return Object.keys(target).reduce((o: any, key) => {
    let [firstKey, ...others] = key.split('_');
    let newKey = [firstKey, ...others.map(capitalize)].join('');
    o[newKey] = snakeToCamelCase(target[key]);
    return o;
  }, {});
}

export function convertTypingFromJSON(target: any) {
  switch (typeof target) {
    case 'string':
      try {
        return JSON.parse(target);
      } catch (e) {
        return target;
      }
    case 'object':
      return Object.keys(target).reduce((o: any, key) => {
        o[key] = convertTypingFromJSON(target[key]);
        return o;
      }, {});
    default:
      return target;
  }
}

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

import crossFetch = require('cross-fetch');
const { Response } = crossFetch;

export function captialize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const createFetchWithTimeout = (timeoutInMillis, fetch) => (input, init): Promise<Response> => {
  let timeout;

  return Promise.race([
    fetch(input, init),
    new Promise(res => {
      timeout = setTimeout(() =>
        res(new Response(null, { status: 408 })),
        timeoutInMillis
      );

      return timeout;
    })
  ])
    .then((response) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      return response;
    });
}

export function snakeToCamelCase(target) {
  if (target === null || typeof target !== 'object' || Array.isArray(target)) return target;
  return Object.keys(target).reduce((o, key) => {
    let [firstKey, ...others] = key.split('_');
    let newKey = [firstKey, ...others.map(captialize)].join('');
    o[newKey] = snakeToCamelCase(target[key]);
    return o;
  }, {});
}

export function convertTypingFromJSON(target) {
  if (typeof target === 'string') {
    try {
      return JSON.parse(target);
    } catch (e) {
      return target;
    }
  } else if (typeof target === 'object') {
    return Object.keys(target).reduce((o, key) => {
      o[key] = convertTypingFromJSON(target[key]);
      return o;
    }, {});
  } else return target;
}

export function delay(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

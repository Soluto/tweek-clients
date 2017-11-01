export function captialize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const fetchWithTimeout = (timeout, fetch): Promise<Response> => {
  return Promise.race([fetch(), requestTimeout(timeout)]);
};

export const createFetchWithTimeout = (timeout, fetch) => (input, init) => {
  return Promise.race([fetch(input, init), requestTimeout(timeout)]);
};

export const requestTimeout = (timeoutInMillis): Promise<Response> => {
  const failureResponse = new Response(null, { status: 408 });
  return new Promise((res, rej) => {
    let wait = setTimeout(() => {
      res(failureResponse);
    }, timeoutInMillis);
  });
};

export function snakeToCamelCase(target) {
  if (target === null || typeof target !== 'object') return target;
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

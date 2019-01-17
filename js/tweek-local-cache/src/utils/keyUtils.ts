export const getAllPrefixes = (key: string) => {
  return key
    .split('/')
    .slice(0, -1)
    .reduce((acc: string[], next) => [...acc, [...acc.slice(-1), next].join('/')], []);
};

export const getKeyPrefix = (key: string) =>
  key
    .split('/')
    .slice(0, -1)
    .join('/');

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

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

export const isHiddenKey = (key: string) => key.startsWith('@') || key.includes('/@');

export const optimizeInclude = (keys: string[]): string[] => {
  const result: string[] = [];

  //copy keys to not modify the original keys
  keys = Array.from(keys);
  keys.sort();

  const handleKey = (key: string) => {
    result.push(key);

    if (!isScanKey(key!)) {
      return;
    }

    const prefixLength = key.length - 1;
    const prefix = key.substring(0, prefixLength);

    while (keys.length && keys[0].startsWith(prefix)) {
      const nextKey = keys.shift()!;
      const relative = nextKey.substring(prefixLength);
      if (isHiddenKey(relative)) {
        handleKey(nextKey);
      }
    }
  };

  while (keys.length) {
    handleKey(keys.shift()!);
  }

  return result;
};

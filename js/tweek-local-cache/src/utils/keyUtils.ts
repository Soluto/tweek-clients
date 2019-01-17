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

  while (keys.length) {
    const currentKey = keys.shift();
    result.push(currentKey!);

    if (!isScanKey(currentKey!)) {
      continue;
    }

    const prefix = currentKey!.substring(0, currentKey!.length - 1);

    while (keys.length && keys[0].startsWith(prefix)) {
      const nextKey = keys.shift();
      const relative = nextKey!.substring(prefix.length);
      if (isHiddenKey(relative)) {
        result.push(nextKey!);
      }
    }
  }

  return result;
};

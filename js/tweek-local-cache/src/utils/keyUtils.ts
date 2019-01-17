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

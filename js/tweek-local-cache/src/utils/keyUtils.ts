import { TweekKeySplitJoin } from '../split-join';

export const getAllPrefixes = (key: string) => {
  return TweekKeySplitJoin.split(key)
    .slice(0, -1)
    .reduce((acc: string[], next) => [...acc, [...acc.slice(-1), next].join('/')], []);
};

export const getKeyPrefix = (key: string) => TweekKeySplitJoin.split(key).slice(0, -1).join('/');

export const isScanKey = (key: string) => key === '_' || key.endsWith('/_');

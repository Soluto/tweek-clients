import { ITweekClient } from 'tweek-client';

export type TweekRepositoryKeys = {
  [key: string]: RepositoryKey<any>;
};

export type FlatKeys = {
  [key: string]: string | number | boolean;
};

export interface ITweekStore {
  save: (keys: TweekRepositoryKeys) => Promise<void>;
  load: () => Promise<TweekRepositoryKeys>;
}

export type Expiration = 'expired' | 'refreshing';

export type RequestedKey = {
  state: 'requested';
  isScan: boolean;
  expiration?: Expiration;
};

export type MissingKey = {
  state: 'missing';
  expiration?: Expiration;
};

export type CachedKey<T> = {
  state: 'cached';
  value: T;
  isScan: false;
  expiration?: Expiration;
};

export type ScanNode = {
  state: 'cached' | 'requested';
  isScan: true;
  expiration?: Expiration;
};

export type RepositoryKey<T> = CachedKey<T> | RequestedKey | ScanNode | MissingKey;

export type TweekRepositoryConfig = {
  client: ITweekClient;
  getPolicy?: GetPolicy;
  refreshInterval?: number;
  refreshDelay?: number;
  intervalErrorPolicy?: IntervalErrorPolicy;
};

export type GetPolicy = {
  notReady?: 'throw' | 'wait';
  notPrepared?: 'throw' | 'prepare';
};

export interface IntervalErrorPolicy {
  (next: () => void, retryCount: number, ex?: Error);
}

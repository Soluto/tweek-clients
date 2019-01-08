import { ITweekClient } from 'tweek-client';

export const enum Expiration {
  expired = 'expired',
  refreshing = 'refreshing',
}

export const enum RepositoryKeyState {
  requested = 'requested',
  missing = 'missing',
  cached = 'cached',
}

export interface IRepositoryKey<T> {
  state: RepositoryKeyState;
  isScan?: boolean;
  value?: T;
  expiration?: Expiration;
}

export type TweekRepositoryKeys = {
  [key: string]: IRepositoryKey<any>;
};

export type FlatKeys = {
  [key: string]: any;
};

export interface ITweekStore {
  save: (keys: TweekRepositoryKeys) => Promise<void>;
  load: () => Promise<TweekRepositoryKeys>;
}

export type TweekRepositoryConfig = {
  client: ITweekClient;
  getPolicy?: GetPolicy;
  refreshInterval?: number;
  refreshDelay?: number;
  refreshErrorPolicy?: RefreshErrorPolicy;
};

export const enum NotReadyPolicy {
  throw = 'throw',
  wait = 'wait',
}

export const enum NotPreparedPolicy {
  throw = 'throw',
  prepare = 'prepare',
}

export type GetPolicy = {
  notReady?: NotReadyPolicy;
  notPrepared?: NotPreparedPolicy;
};

export interface RefreshErrorPolicy {
  (next: () => void, retryCount: number, ex?: Error): void;
}

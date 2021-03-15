import { Context, ITweekClient } from 'tweek-client';

export const enum Expiration {
  expired = 'expired',
  refreshing = 'refreshing',
}

export const enum RepositoryKeyState {
  requested = 'requested',
  missing = 'missing',
  cached = 'cached',
}

export type CachedScanKey = {
  state: RepositoryKeyState.cached;
  isScan: true;
  value?: undefined;
};

export type CachedSingleKey<T> = {
  state: RepositoryKeyState.cached;
  isScan: false;
  value: T;
};

export type CachedKey<T> = CachedScanKey | CachedSingleKey<T>;

export type MissingKey = {
  state: RepositoryKeyState.missing;
  isScan: false;
  value?: undefined;
};

export type RequestedKey = {
  state: RepositoryKeyState.requested;
  isScan: boolean;
  value?: undefined;
};

export type StoredKey<T> = (CachedKey<T> | MissingKey | RequestedKey) & {
  expiration?: Expiration;
};

export type TweekStoredKeys = Record<string, StoredKey<unknown>>;

export type RepositoryCachedKey<T> = {
  state: RepositoryKeyState.cached;
  isScan: boolean;
  value: T;
};

export type RepositoryKey<T> = RepositoryCachedKey<T> | MissingKey | RequestedKey;

export type FlatKeys = Record<string, unknown>;

export interface ITweekStore {
  save: (keys: TweekStoredKeys) => Promise<void>;
  load: () => Promise<TweekStoredKeys | undefined | null>;
}

export type TweekRepositoryConfig = {
  client: ITweekClient;
  refreshInterval?: number;
  refreshDelay?: number;
  refreshErrorPolicy?: RefreshErrorPolicy;
  context?: Context;
};

export interface RefreshErrorPolicy {
  (next: () => void, retryCount: number, ex?: Error): void;
}

import {
  Expiration,
  StoredKey,
  RepositoryKeyState,
  RequestedKey,
  MissingKey,
  CachedScanKey,
  CachedSingleKey,
  CachedKey,
} from './types';

export function request(isScan: boolean): RequestedKey {
  return {
    state: RepositoryKeyState.requested,
    isScan: isScan,
  };
}

export function missing(): MissingKey {
  return {
    state: RepositoryKeyState.missing,
    isScan: false,
  };
}

export function cached(isScan: true): CachedScanKey;
export function cached<T>(isScan: false, value: T): CachedSingleKey<T>;
export function cached<T>(isScan: boolean, value?: T): CachedKey<T> {
  return <CachedKey<T>>{
    state: RepositoryKeyState.cached,
    isScan,
    value,
  };
}

export function refresh<T>(key: StoredKey<T>): StoredKey<T> {
  return {
    ...key,
    expiration: Expiration.refreshing,
  };
}

export function expire<T>(key: StoredKey<T>): StoredKey<T> {
  return {
    ...key,
    expiration: Expiration.expired,
  };
}

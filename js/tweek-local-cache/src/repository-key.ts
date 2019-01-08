import { Expiration, IRepositoryKey, RepositoryKeyState } from './types';

export function request<T = any>(isScan: boolean): IRepositoryKey<T> {
  return {
    state: RepositoryKeyState.requested,
    isScan: isScan,
  };
}

export function missing<T = any>(): IRepositoryKey<T> {
  return {
    state: RepositoryKeyState.missing,
  };
}

export function cached<T>(isScan: true): IRepositoryKey<T>;
export function cached<T>(isScan: false, value: T): IRepositoryKey<T>;
export function cached<T>(isScan: boolean, value?: T): IRepositoryKey<T> {
  return {
    state: RepositoryKeyState.cached,
    isScan,
    value,
  };
}

export function refresh<T>(key: IRepositoryKey<T>): IRepositoryKey<T> {
  return {
    ...key,
    expiration: Expiration.refreshing,
  };
}

export function expire<T>(key: IRepositoryKey<T>): IRepositoryKey<T> {
  return {
    ...key,
    expiration: Expiration.expired,
  };
}

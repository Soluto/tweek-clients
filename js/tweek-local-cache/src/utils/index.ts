import { MissingKey, RepositoryCachedKey, RepositoryKeyState } from '../types';
import Optional from '../optional';

export * from './arrayUtils';
export * from './keyUtils';
export * from './stringUtils';

export function delay(timeout: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function once<T extends Function>(fn: T): T;
export function once(fn: Function): Function {
  let p: Function | undefined = fn;
  return function(this: Function) {
    const result = p && p.apply(this, arguments);
    p = undefined;
    return result;
  };
}

export function getValueOrOptional<T>(cached: RepositoryCachedKey<T> | MissingKey): T | Optional<T> {
  if (cached.isScan) {
    return cached.value;
  }
  return cached.state === RepositoryKeyState.missing ? Optional.none() : Optional.some(cached.value);
}

export function deprecated(target: string, newMethod: string) {
  return function(_: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalValue = descriptor.value;
    let notified = false;
    descriptor.value = function() {
      if (!notified) {
        if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
          console.warn(`the ${target}.${propertyKey} method is deprecated, please use ${target}.${newMethod} instead`);
        }
        notified = true;
      }

      return originalValue.apply(this, arguments);
    };
  };
}

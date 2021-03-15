export * from './arrayUtils';
export * from './keyUtils';
export * from './stringUtils';

export function delay(timeout: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export function once<T extends Function>(fn: T): T;
export function once(fn: Function): Function {
  let p: Function | undefined = fn;
  return function (this: Function) {
    const result = p && p.apply(this, arguments);
    p = undefined;
    return result;
  };
}

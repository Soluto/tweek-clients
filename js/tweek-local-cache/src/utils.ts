export function partitionByIndex<T>(arr: T[], index: number): [T[], T[]] {
  if (index >= 0) {
    return [arr.slice(0, index), arr.slice(index)];
  } else {
    return partitionByIndex(arr, arr.length + index);
  }
}

export function distinct<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function snakeToCamelCase(keyName: string) {
  let [[first], others] = partitionByIndex(keyName.split('_'), 1);
  return [first, ...others.map(capitalize)].join('');
}

export function delay(timeout: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function once<T extends Function>(fn: T): T;
export function once(fn: Function): Function {
  let p: Function | undefined = fn;
  return function() {
    // @ts-ignore TS2683
    const result = p && p.apply(this, arguments);
    p = undefined;
    return result;
  };
}

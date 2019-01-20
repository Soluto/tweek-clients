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

export const flatMap = <T, U>(arr: T[], fn: (t: T) => U[]) => Array.prototype.concat.apply([], arr.map(fn));

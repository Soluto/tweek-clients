export function partitionByIndex(arr, index) {
  if (index >= 0) {
    return [arr.slice(0, index), arr.slice(index)];
  } else {
    return partitionByIndex(arr, arr.length + index);
  }
}

export function distinct(arr) {
  return Array.from(new Set(arr));
}

function captialize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function snakeToCamelCase(keyName) {
  let [[first], others] = partitionByIndex(keyName.split('_'), 1);
  return [first, ...others.map(captialize)].join('');
}

export function delay(timeout): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function noop() {}

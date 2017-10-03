import { Observer } from './types';

export function captialize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function snakeToCamelCase(target) {
  if (typeof target !== 'object') return target;
  return Object.keys(target).reduce((o, key) => {
    let [firstKey, ...others] = key.split('_');
    let newKey = [firstKey, ...others.map(captialize)].join('');
    o[newKey] = snakeToCamelCase(target[key]);
    return o;
  }, {});
}

export function convertTypingFromJSON(target) {
  if (typeof target === 'string') {
    try {
      return JSON.parse(target);
    } catch (e) {
      return target;
    }
  } else if (typeof target === 'object') {
    return Object.keys(target).reduce((o, key) => {
      o[key] = convertTypingFromJSON(target[key]);
      return o;
    }, {});
  } else return target;
}

export function getObserver(observerOrNext: Observer | ((value) => void)): Observer {
  if (typeof observerOrNext === 'function') {
    return {
      next: observerOrNext,
    };
  }
  return observerOrNext;
}

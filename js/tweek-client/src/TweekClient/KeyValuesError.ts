import { KeyValuesErrors } from './types';

export class KeyValuesError extends Error {
  constructor(keyValuesErrors: KeyValuesErrors, message: string);
  constructor(public keyValuesErrors: KeyValuesErrors, ...args: any[]) {
    super(...args);

    Object.setPrototypeOf(this, KeyValuesError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KeyValuesError);
    }
  }
}

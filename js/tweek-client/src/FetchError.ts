export class FetchError extends Error {
  constructor(response: Response, message: string);
  constructor(public response: Response, ...args: any[]) {
    super(...args);

    Object.setPrototypeOf(this, FetchError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }
  }
}

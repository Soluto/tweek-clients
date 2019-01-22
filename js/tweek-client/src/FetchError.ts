export class FetchError extends Error {
  constructor(message: string, public response: Response) {
    super(message);
  }
}

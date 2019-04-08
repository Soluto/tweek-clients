import { GetValuesConfig, ITweekClient } from './types';

export default class TweekClientWithFallback implements ITweekClient {
  constructor(private readonly _clients: ITweekClient[]) {}

  getValues<T>(path: string, config: GetValuesConfig = {}): Promise<T> {
    return this._clients.reduce(
      (acc, client) => acc.catch(() => client.getValues(path, config)),
      Promise.reject() as Promise<T>,
    );
  }

  fetch = this.getValues;
}

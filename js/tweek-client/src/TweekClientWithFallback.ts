import { FetchConfig, ITweekClient } from './types';

export default class TweekClientWithFallback implements ITweekClient {
  constructor(private readonly _clients: ITweekClient[]) {}

  appendContext(identityType: string, identityId: string, context: object): Promise<void> {
    return this._execute(client => client.appendContext(identityType, identityId, context));
  }

  deleteContext(identityType: string, identityId: string, property: string): Promise<void> {
    return this._execute(client => client.deleteContext(identityType, identityId, property));
  }

  fetch<T>(path: string, config?: FetchConfig): Promise<T> {
    return this._execute(client => client.fetch(path, config));
  }

  private _execute<T>(fn: (client: ITweekClient) => Promise<T>): Promise<T> {
    return this._clients.reduce((acc, client) => acc.catch(() => fn(client)), Promise.reject() as Promise<T>);
  }
}

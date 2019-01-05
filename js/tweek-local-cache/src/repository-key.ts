export const enum Expiration {
  expired = 'expired',
  refreshing = 'refreshing',
}

export const enum RepositoryKeyState {
  requested = 'requested',
  missing = 'missing',
  cached = 'cached',
}

export interface IRepositoryKey<T> {
  state: RepositoryKeyState;
  isScan?: boolean;
  value?: T;
  expiration?: Expiration;
}

export class RepositoryKey<T> implements IRepositoryKey<T> {
  constructor(
    readonly state: RepositoryKeyState,
    readonly isScan?: boolean,
    readonly value?: T,
    readonly expiration?: Expiration,
  ) {}

  static from<T>(other: IRepositoryKey<T>) {
    return new RepositoryKey(other.state, other.isScan, other.value, other.expiration);
  }

  static request(isScan: boolean) {
    return new RepositoryKey(RepositoryKeyState.requested, isScan);
  }

  static missing() {
    return new RepositoryKey(RepositoryKeyState.missing);
  }

  static cached<T>(isScan: true): RepositoryKey<T>;
  static cached<T>(isScan: false, value: T): RepositoryKey<T>;
  static cached<T>(isScan: boolean, value?: T) {
    return new RepositoryKey(RepositoryKeyState.cached, isScan, value);
  }

  refresh() {
    return new RepositoryKey(this.state, this.isScan, this.value, Expiration.refreshing);
  }

  expire() {
    return new RepositoryKey(this.state, this.isScan, this.value, Expiration.expired);
  }
}

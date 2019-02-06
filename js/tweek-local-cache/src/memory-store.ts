import { ITweekStore, TweekStoredKeys } from './types';

export default class implements ITweekStore {
  constructor(public _keys: TweekStoredKeys = {}) {}

  save(keys: TweekStoredKeys) {
    this._keys = keys || {};
    return Promise.resolve();
  }

  load() {
    return Promise.resolve(this._keys);
  }
}

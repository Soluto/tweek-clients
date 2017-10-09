import { ITweekStore } from './types';

export default class implements ITweekStore {
  _keys;

  constructor(initialKeys = {}) {
    this._keys = initialKeys;
  }

  save(keys) {
    this._keys = keys || {};
    return Promise.resolve();
  }

  load() {
    return Promise.resolve(this._keys);
  }
}

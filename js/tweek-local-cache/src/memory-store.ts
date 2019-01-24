import { ITweekStore, TweekRepositoryKeys } from './types';

export default class implements ITweekStore {
  _keys: TweekRepositoryKeys;

  constructor(initialKeys: TweekRepositoryKeys = {}) {
    this._keys = initialKeys;
  }

  save(keys: TweekRepositoryKeys) {
    this._keys = keys || {};
    return Promise.resolve();
  }

  load() {
    return Promise.resolve(this._keys);
  }
}

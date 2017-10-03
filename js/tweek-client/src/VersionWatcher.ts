import { createChangeEmitter } from 'change-emitter';
import $$observable from 'symbol-observable';
import { Observer } from './types';
import { getObserver } from './utils';

/**
 * Version Watcher for Tweek rules repository.
 * This is an experimental class and it will change in future releases
 */
export default class {
  private _versionUrl: string;
  private _currentVersion: string;
  private _emitter = createChangeEmitter();
  private _isStopped = true;
  private _sampleInterval: number = 30;
  private _timeout;

  constructor(baseServiceUrl: string) {
    if (!baseServiceUrl.endsWith('/')) {
      baseServiceUrl += '/';
    }

    this._versionUrl = `${baseServiceUrl}api/v1/repo-version`;
  }

  public get currentVersion() {
    return this._currentVersion;
  }
  public get isStopped() {
    return this._isStopped;
  }

  public start(sampleInterval: number = 30) {
    this._sampleInterval = sampleInterval;

    if (!this._isStopped) return;

    this._isStopped = false;
    return this._getVersion();
  }

  public stop() {
    if (this._isStopped) return;

    this._isStopped = true;
    clearTimeout(this._timeout);
    this._timeout = null;
  }

  public subscribe(observerOrNext: Observer | ((value) => void)) {
    const observer = getObserver(observerOrNext);

    function observeVersion(version) {
      if (observer.next) {
        observer.next(version);
      }
    }

    const subscription = { unsubscribe: this._emitter.listen(observeVersion) };
    if (observer.start) {
      observer.start(subscription);
    }

    if (this._currentVersion) {
      observeVersion(this._currentVersion);
    }

    return subscription;
  }

  public [$$observable]() {
    return this;
  }

  private _getVersion() {
    return fetch(this._versionUrl)
      .then(result => {
        if (!result.ok) {
          console.warn('error getting repository version:', result.status, result.statusText);
          return this._currentVersion;
        }
        return result.text();
      })
      .then(version => {
        if (version !== this._currentVersion) {
          this._currentVersion = version;
          this._emitter.emit(version);
        }
      })
      .catch(e => console.error('Unexpected error has occurred while getting repository version', e))
      .then(() => {
        if (!this._isStopped) {
          this._timeout = setTimeout(this._getVersion, this._sampleInterval);
        }
      });
  }
}

import { createChangeEmitter } from 'change-emitter';
import $$observable from 'symbol-observable';
import { Observer } from './types';
import { delay, getObserver } from './utils';

enum MessageType {
  Value,
  Error,
  Complete,
}

type Message = {
  type: MessageType;
  payload?: any;
};

/**
 * Version Watcher for Tweek rules repository.
 * This is an experimental class and it will change in future releases
 */
export default class {
  private _versionUrl: string;
  private _currentVersion: string;
  private _emitter = createChangeEmitter();
  private _isDisposed = false;

  constructor(baseServiceUrl: string, private _sampleInterval: number = 30) {
    if (!baseServiceUrl.endsWith('/')) {
      baseServiceUrl += '/';
    }

    this._versionUrl = `${baseServiceUrl}api/v1/repo-version`;
    this._watchVersion();
  }

  public get currentVersion() {
    return this._currentVersion;
  }

  public get isDisposed() {
    return this._isDisposed;
  }

  public dispose() {
    this._isDisposed = true;
  }

  public subscribe(observerOrNext: Observer | ((value) => void)) {
    if (this._isDisposed) {
      throw new Error('Attempting to subscribe to a disposed watcher');
    }

    const observer = getObserver(observerOrNext);

    function observeVersion({ type, payload }: Message) {
      switch (type) {
        case MessageType.Value:
          observer.next && observer.next(payload);
          break;
        case MessageType.Error:
          observer.error && observer.error(payload);
          break;
        case MessageType.Complete:
          observer.complete && observer.complete();
          break;
      }
    }

    const subscription = { unsubscribe: this._emitter.listen(observeVersion) };
    if (observer.start) {
      observer.start(subscription);
    }

    if (this._currentVersion) {
      observeVersion({ type: MessageType.Value, payload: this._currentVersion });
    }

    return subscription;
  }

  public [$$observable]() {
    return this;
  }

  private async _watchVersion() {
    try {
      while (!this._isDisposed) {
        const result = await fetch(this._versionUrl);
        if (result.ok) {
          const version = await result.text();
          if (version && version !== this._currentVersion) {
            this._currentVersion = version;
            this._emit({ type: MessageType.Value, payload: version });
          }
        }

        if (this._isDisposed) break;

        await delay(this._sampleInterval);
      }

      this._emit({ type: MessageType.Complete });
    } catch (error) {
      this._emit({ type: MessageType.Error, payload: error });
    }
  }

  private _emit(message: Message) {
    this._emitter.emit(message);
  }
}

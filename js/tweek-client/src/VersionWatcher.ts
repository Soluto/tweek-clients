import { createChangeEmitter } from 'change-emitter';
import Observable = require('zen-observable');
import { delay } from './utils';

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
export class VersionWatcher extends Observable<string> {
  private readonly _emitter = createChangeEmitter();
  private readonly _versionUrl: string;

  private _startedWatching = false;
  private _isDisposed = false;
  private _currentVersion: string | undefined;

  constructor(baseServiceUrl: string, private readonly _sampleInterval: number = 30) {
    super(observer => {
      if (this._isDisposed) {
        observer.complete();
      }

      this._watchVersion();

      function observeVersion({ type, payload }: Message) {
        switch (type) {
          case MessageType.Value:
            observer.next(payload);
            break;
          case MessageType.Error:
            observer.error(payload);
            break;
          case MessageType.Complete:
            observer.complete();
            break;
        }
      }

      if (this._currentVersion) {
        observeVersion({ type: MessageType.Value, payload: this._currentVersion });
      }

      return this._emitter.listen(observeVersion);
    });

    if (!baseServiceUrl.endsWith('/')) {
      baseServiceUrl += '/';
    }

    this._versionUrl = `${baseServiceUrl}status`;
  }

  get currentVersion(): string | undefined {
    return this._currentVersion;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  dispose() {
    this._isDisposed = true;
  }

  private _emit(message: Message) {
    this._emitter.emit(message);
  }

  private async _watchVersion() {
    if (this._startedWatching) {
      return;
    }

    this._startedWatching = true;

    try {
      while (!this._isDisposed) {
        const result = await fetch(this._versionUrl);
        if (result.ok) {
          const status = await result.json();
          const version = status && status['repository revision'];
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
}

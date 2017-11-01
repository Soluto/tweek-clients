import { createChangeEmitter } from 'change-emitter';
import Observable = require('zen-observable');
import $$observable from 'symbol-observable';
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
 * This is an experimental function and it will change in future releases
 */
export default function watchVersion(baseServiceUrl: string, sampleIterval: number = 30) {
  if (!baseServiceUrl.endsWith('/')) {
    baseServiceUrl += '/';
  }
  const versionUrl = `${baseServiceUrl}api/v1/repo-version`;
  const emitter = createChangeEmitter();
  let isDisposed = false;
  let currentVersion;

  function emit(message: Message) {
    emitter.emit(message);
  }

  async function watchVersion() {
    try {
      while (!isDisposed) {
        const result = await fetch(versionUrl);
        if (result.ok) {
          const version = await result.text();
          if (version && version !== currentVersion) {
            currentVersion = version;
            emit({ type: MessageType.Value, payload: version });
          }
        }

        if (isDisposed) break;

        await delay(sampleIterval);
      }

      emit({ type: MessageType.Complete });
    } catch (error) {
      emit({ type: MessageType.Error, payload: error });
    }
  }

  watchVersion();

  const observable = new Observable<any>(observer => {
    if (isDisposed) {
      observer.complete();
    }

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

    if (currentVersion) {
      observeVersion({ type: MessageType.Value, payload: currentVersion });
    }

    return emitter.listen(observeVersion);
  });

  return {
    get currentVersion() {
      return currentVersion;
    },
    get isDisposed() {
      return isDisposed;
    },
    dispose() {
      isDisposed = true;
    },
    subscribe: observable.subscribe.bind(observable),
    [$$observable]() {
      return this;
    },
  };
}

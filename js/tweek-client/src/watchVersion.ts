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
    subscribe(observerOrNext: Observer | ((value) => void), onError?: (error) => void, onComplete?: () => void) {
      if (isDisposed) {
        throw new Error('Attempting to subscribe to a disposed watcher');
      }

      const observer = getObserver(observerOrNext, onError, onComplete);

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

      const subscription = { unsubscribe: emitter.listen(observeVersion) };
      if (observer.start) {
        observer.start(subscription);
      }

      if (currentVersion) {
        observeVersion({ type: MessageType.Value, payload: currentVersion });
      }

      return subscription;
    },
    [$$observable]() {
      return this;
    },
  };
}

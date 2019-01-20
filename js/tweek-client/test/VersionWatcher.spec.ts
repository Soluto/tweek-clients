import fetchMock from 'fetch-mock';
import { expect } from 'chai';
import VersionWatcher from '../src/VersionWatcher';
import { delay } from '../src/utils';

describe('VersionWatcher', () => {
  const baseServiceUrl = 'http://test/';
  const matcher = 'http://test/status';

  function watcherToPromise(watcher: VersionWatcher, count?: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const result: any[] = [];
      watcher.subscribe({
        next: v => {
          result.push(v);
          if (count !== undefined && result.length >= count) {
            watcher.dispose();
          }
        },
        error: err => {
          reject(err);
        },
        complete: () => {
          resolve(result);
        },
      });
    });
  }

  afterEach(fetchMock.restore);

  it('should emit items when version changes', async () => {
    let count = 0;
    fetchMock.get(matcher, () => {
      const currentCount = count;
      count++;
      return { 'repository revision': currentCount.toString() };
    });

    const watcher = new VersionWatcher(baseServiceUrl, 2);

    const versions = await watcherToPromise(watcher, 5);

    const calls = fetchMock.calls(matcher);
    expect(calls).to.have.lengthOf(versions.length);
  });

  it('should emit items only when version changes', async () => {
    fetchMock.get(matcher, { 'repository revision': 'someVersion' });
    const watcher = new VersionWatcher(baseServiceUrl, 2);

    const resultPromise = watcherToPromise(watcher);
    await delay(10);
    watcher.dispose();

    await expect(resultPromise).to.eventually.be.lengthOf(1);
    await expect(resultPromise).to.eventually.include('someVersion');

    const calls = fetchMock.calls(matcher);
    expect(calls).to.have.lengthOf.above(1);
  });

  it("should stop emitting after 'dispose' was called", async () => {
    fetchMock.get(matcher, { 'repository revision': 'someVersion' });
    const watcher = new VersionWatcher(baseServiceUrl, 2);

    await watcherToPromise(watcher, 1);

    await delay(10);

    const calls = fetchMock.calls(matcher);
    expect(calls).to.have.lengthOf(1);
  });

  it('should retry if fetch error', async () => {
    fetchMock.getOnce(matcher, 500);
    fetchMock.get(matcher, { 'repository revision': 'someVersion' }, { overwriteRoutes: false });

    const watcher = new VersionWatcher(baseServiceUrl, 2);

    const resultPromise = watcherToPromise(watcher, 1);

    await expect(resultPromise).to.be.fulfilled;
  });
});

import { createTweekClient } from './createTweekClient';
import TweekClientWithFallback from './TweekClientWithFallback';
import { BaseCreateTweekClientConfig } from './types';

export type CreateTweekClientConfigWithFallback = BaseCreateTweekClientConfig & {
  urls: string[];
};

export function createTweekClientWithFallback({ urls, ...config }: CreateTweekClientConfigWithFallback) {
  const clients = urls.map(baseServiceUrl => createTweekClient({ baseServiceUrl, ...config }));
  return new TweekClientWithFallback(clients);
}

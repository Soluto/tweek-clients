import { CreateTweekClientWithFallbackConfig } from './types';
import createTweekClient from './createTweekClient';
import TweekClientWithFallback from './TweekClientWithFallback';

export default function({ urls, ...config }: CreateTweekClientWithFallbackConfig) {
  const clients = urls.map(baseServiceUrl => createTweekClient({ baseServiceUrl, ...config }));
  return new TweekClientWithFallback(clients);
}

import { createFetchClient } from '../utils';
import { BaseCreateTweekClientConfig } from './types';
import TweekClient from './TweekClient';

export type CreateTweekClientConfig = BaseCreateTweekClientConfig & {
  baseServiceUrl: string;
};

export function createTweekClient({
  baseServiceUrl,
  context = {},
  useLegacyEndpoint,
  ...fetchClientConfig
}: CreateTweekClientConfig) {
  return new TweekClient(
    {
      baseServiceUrl,
      context,
      fetch: createFetchClient(fetchClientConfig),
    },
    useLegacyEndpoint,
  );
}

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
  onKeyError,
  ...fetchClientConfig
}: CreateTweekClientConfig) {
  return new TweekClient(
    {
      baseServiceUrl,
      context,
      fetch: createFetchClient(fetchClientConfig),
      onKeyError,
    },
    useLegacyEndpoint,
  );
}

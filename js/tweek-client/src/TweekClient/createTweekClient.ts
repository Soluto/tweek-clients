import { createFetchClient } from '../utils';
import { CreateClientConfig } from '../types';
import { Context } from './types';
import TweekClient from './TweekClient';

export type CreateTweekClientConfig = CreateClientConfig & {
  context?: Context;
  useLegacyEndpoint?: boolean;
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

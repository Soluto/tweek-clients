import { createFetchClient } from '../utils';
import { FetchClientConfig } from '../types';
import TweekManagementClient from './TweekManagementClient';

export type CreateTweekManagementClientConfig = FetchClientConfig & {
  baseServiceUrl: string;
};

export function createTweekManagementClient({
  baseServiceUrl,
  ...fetchClientConfig
}: CreateTweekManagementClientConfig) {
  return new TweekManagementClient({
    baseServiceUrl,
    fetch: createFetchClient(fetchClientConfig),
  });
}

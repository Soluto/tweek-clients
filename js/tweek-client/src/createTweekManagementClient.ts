import { createFetchClient } from './utils';
import { CreateClientConfig } from './types';
import { TweekManagementClient } from './TweekManagementClient';

export function createTweekManagementClient({ baseServiceUrl, ...fetchClientConfig }: CreateClientConfig) {
  return new TweekManagementClient({
    baseServiceUrl,
    fetch: createFetchClient(fetchClientConfig),
  });
}

import { ITweekManagementClient, TweekInitConfig } from './types';
import { normalizeBaseUrl } from './utils';

export default class TweekManagementClient implements ITweekManagementClient {
  constructor(public config: TweekInitConfig) {
    this.config.baseServiceUrl = normalizeBaseUrl(config.baseServiceUrl);
  }

  appendContext(identityType: string, identityId: string, context: object): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v1/context/${identityType}/${identityId}`;
    const result = this.config
      .fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error appending context, code ${response.status}, message: '${response.statusText}'`);
        }
      });
    return <Promise<void>>result;
  }

  deleteContext(identityType: string, identityId: string, property: string): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v1/context/${identityType}/${identityId}/${property}`;
    const result = this.config.fetch(url, { method: 'DELETE' }).then(response => {
      if (!response.ok) {
        throw new Error(`Error deleting context property, code ${response.status}, message: '${response.statusText}'`);
      }
    });
    return <Promise<void>>result;
  }
}

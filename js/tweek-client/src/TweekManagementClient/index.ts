import { IdentityContext, TweekInitConfig } from '../types';
import { normalizeBaseUrl, toQueryString } from '../utils';
import {
  AuthProvider,
  CurrentUser,
  ITweekManagementClient,
  KeyDefinition,
  KeyManifest,
  Patch,
  Revision,
  Schema,
  Services,
  Policy,
} from './types';
import { InputParams } from 'query-string';
import { FetchError } from '../FetchError';

export * from './types';

const jsonHeaders = { 'Content-Type': 'application/json' };

const noop = () => {};
const toJson = (response: Response) => response.json();
const defaultSearchCount = 25;

export class TweekManagementClient implements ITweekManagementClient {
  constructor(public config: TweekInitConfig) {
    this.config.baseServiceUrl = normalizeBaseUrl(config.baseServiceUrl);
  }

  getAllKeyManifests(): Promise<KeyManifest[]> {
    const url = `${this.config.baseServiceUrl}/api/v2/manifests`;
    return this._fetch(url).then(toJson);
  }

  getKeyManifest(path: string): Promise<KeyManifest> {
    const url = `${this.config.baseServiceUrl}/api/v2/manifests/${path}`;
    return this._fetch(url).then(toJson);
  }

  getKeyDependents(path: string): Promise<string[]> {
    const url = `${this.config.baseServiceUrl}/api/v2/dependents/${path}`;
    return this._fetch(url).then(toJson);
  }

  getKeyDefinition(path: string, revision?: string): Promise<KeyDefinition> {
    const queryParamsObject: InputParams = { revision };
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/keys/${path}${queryString}`;
    return this._fetch(url).then(toJson);
  }

  saveKeyDefinition(path: string, keyDefinition: KeyDefinition): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v2/keys/${path}`;
    const config = {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(keyDefinition),
    };

    return this._fetch(url, config).then(noop);
  }

  deleteKey(path: string, aliases: string[] = []): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v2/keys/${path}`;
    const config = {
      method: 'DELETE',
      headers: jsonHeaders,
      body: JSON.stringify(aliases),
    };

    return this._fetch(url, config).then(noop);
  }

  getKeyRevisionHistory(path: string, since: string = '1 month ago'): Promise<Revision[]> {
    const queryParamsObject = { since };
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/revision-history/${path}${queryString}`;
    return this._fetch(url).then(toJson);
  }

  getAllTags(): Promise<string[]> {
    const url = `${this.config.baseServiceUrl}/api/v2/tags`;
    return this._fetch(url).then(toJson);
  }

  appendTags(tags: string[]): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v2/tags`;
    const config = {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(tags),
    };

    return this._fetch(url, config).then(noop);
  }

  getSuggestions(query: string, count?: number): Promise<string[]> {
    const queryParamsObject = {
      q: query,
      count: count || defaultSearchCount,
    };
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/suggestions${queryString}`;
    return this._fetch(url).then(toJson);
  }

  search(query: string, count?: number): Promise<string[]> {
    const queryParamsObject = {
      q: query,
      count: count || defaultSearchCount,
    };
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/search${queryString}`;
    return this._fetch(url).then(toJson);
  }

  getContext(identityType: string, identityId: string): Promise<IdentityContext> {
    const url = `${this.config.baseServiceUrl}/api/v2/context/${identityType}/${encodeURIComponent(identityId)}`;
    return this._fetch(url).then(toJson);
  }

  appendContext(identityType: string, identityId: string, context: IdentityContext): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v2/context/${identityType}/${encodeURIComponent(identityId)}`;
    const config = {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(context),
    };
    return this._fetch(url, config).then(noop);
  }

  deleteContext(identityType: string, identityId: string, property: string): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v2/context/${identityType}/${encodeURIComponent(
      identityId,
    )}/${property}`;
    const config = { method: 'DELETE' };
    return this._fetch(url, config).then(noop);
  }

  getAllSchemas(): Promise<Schema[]> {
    const url = `${this.config.baseServiceUrl}/api/v2/schemas`;
    return this._fetch(url).then(toJson);
  }

  deleteIdentity(identityType: string): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v2/schemas/${identityType}`;
    const config = { method: 'DELETE' };
    return this._fetch(url, config).then(noop);
  }

  addNewIdentity(identityType: string, schema: Schema): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v2/schemas/${identityType}`;
    const config = {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(schema),
    };
    return this._fetch(url, config).then(noop);
  }

  updateIdentity(identityType: string, patch: Patch): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v2/schemas/${identityType}`;
    const config = {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(patch),
    };
    return this._fetch(url, config).then(noop);
  }

  currentUser(): Promise<CurrentUser> {
    const url = `${this.config.baseServiceUrl}/api/v2/current-user`;
    return this._fetch(url).then(toJson);
  }

  getPolicies(): Promise<Policy[]> {
    const url = `${this.config.baseServiceUrl}/api/v2/policies`;
    return this._fetch(url).then(toJson).then(json => json.policies);
  }

  updatePolicies(policies: Policy[]): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v2/policies`;
    const config = {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({policies}),
    };
    return this._fetch(url, config).then(noop);
  }

  getAuthProviders(): Promise<AuthProvider[]> {
    const url = `${this.config.baseServiceUrl}/auth/providers`;
    return this._fetch(url).then(toJson);
  }

  getServiceDetails(): Promise<Services> {
    const url = `${this.config.baseServiceUrl}/version`;
    return this._fetch(url).then(toJson);
  }

  private _fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return this.config.fetch(input, init).then<Response>(response => {
      if (!response.ok) {
        return Promise.reject(new FetchError(response, 'tweek server responded with an error'));
      }
      return response;
    });
  }
}

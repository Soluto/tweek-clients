import { IdentityContext, TweekInitConfig } from '../types';
import { normalizeBaseUrl, toQueryString } from '../utils';
import { Author, ITweekManagementClient, KeyDefinition, KeyManifest, Patch, Revision, Schema } from './types';
import { InputParams } from 'query-string';
import { FetchError } from '../FetchError';

export * from './types';

const toAuthorQueryParams = (author: Author) => ({
  'author.name': author.name,
  'author.email': author.email,
});

const jsonHeaders = { 'Content-Type': 'application/json' };

const noop = () => {};
const defaultSearchCount = 25;

export class TweekManagementClient implements ITweekManagementClient {
  constructor(public config: TweekInitConfig) {
    this.config.baseServiceUrl = normalizeBaseUrl(config.baseServiceUrl);
  }

  getAllKeyManifests(): Promise<KeyManifest[]> {
    const url = `${this.config.baseServiceUrl}/api/v2/manifests`;
    return this._fetch(url).then(response => response.json());
  }

  getKeyManifest(path: string): Promise<KeyManifest> {
    const url = `${this.config.baseServiceUrl}/api/v2/manifests/${path}`;
    return this._fetch(url).then(response => response.json());
  }

  getKeyDependents(path: string): Promise<string[]> {
    const url = `${this.config.baseServiceUrl}/api/v2/dependents/${path}`;
    return this._fetch(url).then(response => response.json());
  }

  getKeyDefinition(path: string, revision?: string): Promise<KeyDefinition> {
    const queryParamsObject: InputParams = { revision };
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/keys/${path}${queryString}`;
    return this._fetch(url).then(response => response.json());
  }

  saveKeyDefinition(path: string, author: Author, keyDefinition: KeyDefinition): Promise<void> {
    const queryParamsObject = toAuthorQueryParams(author);
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/keys/${path}${queryString}`;
    const config = {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(keyDefinition),
    };

    return this._fetch(url, config).then(noop);
  }

  deleteKey(path: string, author: Author, aliases: string[] = []): Promise<void> {
    const queryParamsObject = toAuthorQueryParams(author);
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/keys/${path}${queryString}`;
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
    return this._fetch(url).then(response => response.json());
  }

  getAllTags(): Promise<string[]> {
    const url = `${this.config.baseServiceUrl}/api/v2/tags`;
    return this._fetch(url).then(response => response.json());
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
    return this._fetch(url).then(response => response.json());
  }

  search(query: string, count?: number): Promise<string[]> {
    const queryParamsObject = {
      q: query,
      count: count || defaultSearchCount,
    };
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/search${queryString}`;
    return this._fetch(url).then(response => response.json());
  }

  getContext(identityType: string, identityId: string): Promise<IdentityContext> {
    const url = `${this.config.baseServiceUrl}/api/v2/context/${identityType}/${encodeURIComponent(identityId)}`;
    return this._fetch(url).then(response => response.json());
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
    return this._fetch(url).then(response => response.json());
  }

  deleteIdentity(identityType: string, author: Author): Promise<void> {
    const queryParamsObject = toAuthorQueryParams(author);
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/schemas/${identityType}${queryString}`;
    const config = { method: 'DELETE' };
    return this._fetch(url, config).then(noop);
  }

  addNewIdentity(identityType: string, author: Author, schema: Schema): Promise<void> {
    const queryParamsObject = toAuthorQueryParams(author);
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/schemas/${identityType}${queryString}`;
    const config = {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(schema),
    };
    return this._fetch(url, config).then(noop);
  }

  updateIdentity(identityType: string, author: Author, patch: Patch): Promise<void> {
    const queryParamsObject = toAuthorQueryParams(author);
    const queryString = toQueryString(queryParamsObject);
    const url = `${this.config.baseServiceUrl}/api/v2/schemas/${identityType}${queryString}`;
    const config = {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(patch),
    };
    return this._fetch(url, config).then(noop);
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

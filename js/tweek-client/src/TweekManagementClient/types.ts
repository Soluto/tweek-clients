import { Operation } from 'fast-json-patch';
import { IdentityContext } from '../types';

export type KeyImplementation = {
  format: string;
  type: string;
  [s: string]: any;
};

export type KeyMetadata = {
  name: string;
  description: string;
  readOnly?: boolean;
  archived?: boolean;
};

export type KeyManifest = {
  key_path: string;
  meta: KeyMetadata;
  implementation: KeyImplementation;
  valueType: string;
  dependencies: string[];
};

export type KeyDefinition = {
  manifest: KeyManifest;
  implementation?: KeyImplementation;
};

export type Author = {
  name: string;
  email: string;
};

export type Schema = { [s: string]: any };

export type Patch = Operation[];

export type Revision = {
  sha: string;
  date: number;
  author: string;
};

export interface ITweekManagementClient {
  getAllKeyManifests(): Promise<KeyManifest[]>;
  getKeyManifest(path: string): Promise<KeyManifest>;
  getKeyDependents(path: string): Promise<string[]>;
  getKeyDefinition(path: string, revision?: string): Promise<KeyDefinition>;
  saveKeyDefinition(path: string, author: Author, keyDefinition: KeyDefinition): Promise<void>;
  deleteKey(path: string, author: Author, additionalKeys?: string[]): Promise<void>;
  getKeyRevisionHistory(path: string, since?: string): Promise<Revision[]>;

  getAllTags(): Promise<string[]>;
  appendTags(tags: string[]): Promise<void>;

  getSuggestions(query: string, count?: number): Promise<string[]>;
  search(query: string, count?: number): Promise<string[]>;

  getContext(identityType: string, identityId: string): Promise<IdentityContext>;
  appendContext(identityType: string, identityId: string, context: IdentityContext): Promise<void>;
  deleteContext(identityType: string, identityId: string, property: string): Promise<void>;

  getAllSchemas(): Promise<Schema[]>;
  deleteIdentity(identityType: string, author: Author): Promise<void>;
  addNewIdentity(identityType: string, author: Author, schema: Schema): Promise<void>;
  updateIdentity(identityType: string, author: Author, patch: Patch): Promise<void>;
}

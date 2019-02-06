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
  implementation?: string;
};

export type Schema = { [s: string]: any };

export type Patch = Operation[];

export type Revision = {
  sha: string;
  date: number;
  author: string;
};

export type CurrentUser = {
  Email: string;
  Group: string;
  Name: string;
  User: string;
};

export type AuthLoginInfo = {
  login_type: string;
  additional_info: { [s: string]: any };
  scope: string;
  response_type: string;
};

export type AuthProvider = {
  name: string;
  issuer: string;
  authority: string;
  client_id: string;
  jwks_uri: string;
  login_info: AuthLoginInfo;
};

export type ServiceDetails = {
  version: string;
  status: string;
};

export const enum Action {
  Read = 'read',
  Write = 'write',
  All = '*',
}
export const enum Effect {
  Allow = 'allow',
  Deny = 'deny',
}
export type Policy = {
  group: string;
  user: string;
  contexts: { [identityId: string]: string };
  object: string;
  action: Action;
  effect: Effect;
};

export type Services = { [s: string]: ServiceDetails };

export interface ITweekManagementClient {
  getAllKeyManifests(): Promise<KeyManifest[]>;
  getKeyManifest(path: string): Promise<KeyManifest>;
  getKeyDependents(path: string): Promise<string[]>;
  getKeyDefinition(path: string, revision?: string): Promise<KeyDefinition>;
  saveKeyDefinition(path: string, keyDefinition: KeyDefinition): Promise<void>;
  deleteKey(path: string, additionalKeys?: string[]): Promise<void>;
  getKeyRevisionHistory(path: string, since?: string): Promise<Revision[]>;

  getAllTags(): Promise<string[]>;
  appendTags(tags: string[]): Promise<void>;

  getSuggestions(query: string, count?: number): Promise<string[]>;
  search(query: string, count?: number): Promise<string[]>;

  getContext(identityType: string, identityId: string): Promise<IdentityContext>;
  appendContext(identityType: string, identityId: string, context: IdentityContext): Promise<void>;
  deleteContextProperty(identityType: string, identityId: string, property: string): Promise<void>;
  deleteContext(identityType: string, identityId: string): Promise<void>;

  getAllSchemas(): Promise<Schema[]>;
  deleteIdentity(identityType: string): Promise<void>;
  addNewIdentity(identityType: string, schema: Schema): Promise<void>;
  updateIdentity(identityType: string, patch: Patch): Promise<void>;

  currentUser(): Promise<CurrentUser>;
  getAuthProviders(): Promise<AuthProvider[]>;
  getServiceDetails(): Promise<Services>;

  getPolicies(): Promise<{ policies: Policy[] }>;
  replacePolicies(policies: Policy[]): Promise<void>;
  patchPolicies(patch: Patch): Promise<void>;

  getJWTExtractionPolicy(): Promise<string>;
  updateJWTExtractionPolicy(jwtRegoPolicy: string): Promise<void>;
}

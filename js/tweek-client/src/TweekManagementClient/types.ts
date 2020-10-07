import { Operation } from 'fast-json-patch';
import { IdentityContext } from '../types';

export type KeyImplementation = {
  format?: string;
  type: string;
  [s: string]: unknown;
};

export type KeyMetadata = {
  name: string;
  description: string;
  readOnly?: boolean;
  archived?: boolean;
  tags?: string[];
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

export type KeyDependents = {
  usedBy: string[];
  aliases: string[];
};

export type Schema = Record<string, unknown>;

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
  additional_info: Record<string, unknown>;
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

export type Hook = {
  id: string;
  keyPath: string;
  type: string;
  url: string;
};

export type ExternalAppSecret = {
  id: string;
  creationDate: Date;
};

export type ExternalApp = {
  id: string;
  name: string;
  version: string;
  permissions?: string[];
  secrets?: ExternalAppSecret[];
};

export type CreateExternalAppResponse = {
  appId: string;
  secret: string;
};

export type ExternalAppData = {
  name: string;
  permissions: string[];
};

export type CreateExternalAppSecretKeyResponse = {
  keyId: string;
  secret: string;
};

export type Services = { [s: string]: ServiceDetails };

export interface ITweekManagementClient {
  getAllKeyManifests(): Promise<KeyManifest[]>;
  getKeyManifest(keyPath: string): Promise<KeyManifest>;
  getKeyDependents(keyPath: string): Promise<KeyDependents>;
  getKeyDefinition(keyPath: string, revision?: string): Promise<KeyDefinition>;
  saveKeyDefinition(keyPath: string, keyDefinition: KeyDefinition): Promise<void>;
  deleteKey(keyPath: string, additionalKeyPaths?: string[]): Promise<void>;
  getKeyRevisionHistory(keyPath: string, since?: string): Promise<Revision[]>;

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
  saveIdentity(identityType: string, schema: Schema): Promise<void>;
  patchIdentity(identityType: string, patch: Patch): Promise<void>;

  currentUser(): Promise<CurrentUser>;
  getAuthProviders(): Promise<AuthProvider[]>;
  getServiceDetails(): Promise<Services>;

  getPolicies(): Promise<Policy[]>;
  savePolicies(policies: Policy[]): Promise<void>;
  patchPolicies(patch: Patch): Promise<void>;

  getJWTExtractionPolicy(): Promise<string>;
  saveJWTExtractionPolicy(jwtRegoPolicy: string): Promise<void>;

  getHooks(keyPathFilter?: string): Promise<Hook[]>;
  createHook(hookData: { keyPath: string; type: string; url: string }): Promise<Hook>;
  updateHook(hook: Hook): Promise<void>;
  deleteHook(idObject: { id: string }): Promise<void>;

  getExternalApps(): Promise<ExternalApp[]>;
  getExternalApp(appId: string): Promise<ExternalApp>;
  createExternalApp(appData: ExternalAppData): Promise<CreateExternalAppResponse>;
  updateExternalApp(appId: string, appData: Partial<ExternalAppData>): Promise<void>;
  deleteExternalApp(appId: string): Promise<void>;
  createExternalAppSecretKey(appId: string): Promise<CreateExternalAppSecretKeyResponse>;
  deleteExternalAppSecretKey(appId: string, keyId: string): Promise<void>;
}

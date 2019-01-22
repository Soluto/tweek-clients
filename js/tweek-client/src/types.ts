export type IdentityContext = { id?: string } & {
  [prop: string]: string | number | boolean;
};

export type Context = {
  [identityType: string]: IdentityContext;
};

export type FetchConfig = {
  include?: string[];
  flatten?: boolean;
  context?: Context;
  ignoreKeyTypes?: boolean;
  maxChunkSize?: number;
  onError?(error: Error): void;
};

export type TweekInitConfig = FetchConfig & {
  baseServiceUrl: string;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

export interface ITweekClient {
  fetch<T>(path: string, config?: FetchConfig): Promise<T>;
  appendContext(identityType: string, identityId: string, context: object): Promise<void>;
  deleteContext(identityType: string, identityId: string, property: string): Promise<void>;
}

type CreateTweekClientBaseConfig = {
  context?: any;
  requestTimeoutInMillis?: number;
  getAuthenticationToken?: () => Promise<string> | string;
  clientName?: string;
  fetch?: typeof fetch;
  onError?(error: Error): void;
};

export type CreateTweekClientConfig = CreateTweekClientBaseConfig & {
  baseServiceUrl: string;
};

export type CreateTweekClientWithFallbackConfig = CreateTweekClientBaseConfig & {
  urls: string[];
};

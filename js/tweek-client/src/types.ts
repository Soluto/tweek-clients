export type IdentityContext = { id?: string } & {
  [prop: string]: string | number | boolean | Array<string | number | boolean>;
};

export type Context = {
  [identityType: string]: string | IdentityContext;
};

export type GetValuesConfig = {
  context?: Context;
  include?: string[];
  flatten?: boolean;
  ignoreKeyTypes?: boolean;
  maxChunkSize?: number;
};

export type TweekInitConfig = {
  baseServiceUrl: string;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

export interface ITweekClient {
  getValues<T>(path: string, config?: GetValuesConfig): Promise<T>;
}

export interface ITweekManagementClient {
  appendContext(identityType: string, identityId: string, context: object): Promise<void>;
  deleteContext(identityType: string, identityId: string, property: string): Promise<void>;
}

type CreateTweekClientBaseConfig = {
  context?: any;
  requestTimeoutInMillis?: number;
  getAuthenticationToken?: () => Promise<string> | string;
  clientName?: string;
  fetch?: typeof fetch;
  onError?(response: Response): void;
};

export type CreateTweekClientConfig = CreateTweekClientBaseConfig & {
  baseServiceUrl: string;
};

export type CreateTweekClientWithFallbackConfig = CreateTweekClientBaseConfig & {
  urls: string[];
};

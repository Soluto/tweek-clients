export type IdentityContext = { id?: string } & {
  [prop: string]: string | number | boolean;
};

export type Context = {
  [identityType: string]: IdentityContext;
};

export type TweekCasing = 'snake' | 'camelCase';

export type FetchConfig = {
  include?: string[];
  casing?: TweekCasing;
  convertTyping?: boolean;
  flatten?: boolean;
  context?: Context;
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

export type Observer = {
  start?: (subscription: { unsubscribe: () => void }) => void;
  next?: (value) => void;
  error?: (error) => void;
  complete?: () => void;
};

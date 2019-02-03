export type IdentityContext = {
  [prop: string]: string | number | boolean | Array<string | number | boolean>;
};

export type TweekInitConfig = {
  baseServiceUrl: string;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

export type BearerAuthenticationOptions = {
  getAuthenticationToken: () => Promise<string> | string;
  clientId?: undefined;
  clientSecret?: undefined;
};

export type ClientCredentialsOptions = {
  getAuthenticationToken?: undefined;
  clientId: string;
  clientSecret: string;
};

export type NoCredentialsOptions = {
  getAuthenticationToken?: undefined;
  clientId?: undefined;
  clientSecret?: undefined;
};

export type FetchClientConfig = (BearerAuthenticationOptions | ClientCredentialsOptions | NoCredentialsOptions) & {
  fetch?: typeof fetch;
  requestTimeoutInMillis?: number;
  onError?(response: Response): void;
};

export type CreateClientConfig = FetchClientConfig & {
  baseServiceUrl: string;
};

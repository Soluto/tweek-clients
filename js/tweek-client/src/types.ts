export type IdentityContext = {
  [prop: string]: string | number | boolean | Array<string | number | boolean>;
};

export type TweekInitConfig = {
  baseServiceUrl: string;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

export type FetchClientConfig = {
  getAuthenticationToken?: () => Promise<string> | string;
  clientName?: string;
  fetch?: typeof fetch;
  requestTimeoutInMillis?: number;
  onError?(response: Response): void;
};

export type CreateClientConfig = FetchClientConfig & {
  baseServiceUrl: string;
};

export type IdentityContext = {
  [prop: string]: string | number | boolean | Array<string | number | boolean>;
};

export type TweekInitConfig = {
  baseServiceUrl: string;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

import { IdentityContext, TweekInitConfig } from '../types';

export type Context = {
  [identityType: string]: string | ({ id?: string } & IdentityContext);
};

type RequestConfig = {
  include?: string[];
};

type ClientConfig = {
  context?: Context;
  flatten?: boolean;
  ignoreKeyTypes?: boolean;
  maxChunkSize?: number;
};

export type GetValuesConfig = ClientConfig & RequestConfig;

export type TweekClientConfig = TweekInitConfig & ClientConfig;

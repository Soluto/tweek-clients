import { TweekInitConfig } from '../types';

export type IdentityContext = { id?: string } & {
  [prop: string]: string | number | boolean | Array<string | number | boolean>;
};

export type Context = {
  [identityType: string]: string | IdentityContext;
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

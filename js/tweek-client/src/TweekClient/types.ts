import { FetchClientConfig, IdentityContext, TweekInitConfig } from '../types';

export type Context = {
  [identityType: string]: string | ({ id?: string } & IdentityContext);
};

type RequestConfig = {
  include?: string[];
};

export type KeyValuesErrors = { [keyPath: string]: string };

type ClientConfig = {
  context?: Context;
  flatten?: boolean;
  ignoreKeyTypes?: boolean;
  maxChunkSize?: number;
};

export type GetValuesConfig = ClientConfig & RequestConfig;

export type TweekClientConfig = TweekInitConfig & ClientConfig;

export type BaseCreateTweekClientConfig = FetchClientConfig & {
  context?: Context;
  useLegacyEndpoint?: boolean;
};

export type DetailedTweekResult<T> = {
  data: T;
  errors: KeyValuesErrors;
};

export interface ITweekClient {
  getValues<T>(path: string, config?: GetValuesConfig): Promise<T>;

  getValuesWithDetails<T>(path: string, config?: GetValuesConfig): Promise<DetailedTweekResult<T>>;
}

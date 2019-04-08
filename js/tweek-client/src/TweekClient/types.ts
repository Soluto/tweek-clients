import { FetchClientConfig, IdentityContext, TweekInitConfig } from '../types';

export type Context = {
  [identityType: string]: string | ({ id?: string } & IdentityContext);
};

type RequestConfig = {
  include?: string[];
};

export type KeyValuesErrors = { [keyPath: string]: string };

export type KeyValuesErrorHandler = (errors: KeyValuesErrors) => void;

type ClientConfig = {
  context?: Context;
  flatten?: boolean;
  ignoreKeyTypes?: boolean;
  maxChunkSize?: number;
  onKeyError?: KeyValuesErrorHandler;
  throwOnError?: boolean;
};

export type GetValuesConfig = ClientConfig & RequestConfig;

export type TweekClientConfig = TweekInitConfig & ClientConfig;

export type BaseCreateTweekClientConfig = FetchClientConfig & {
  context?: Context;
  useLegacyEndpoint?: boolean;
};

export interface ITweekClient {
  getValues<T>(path: string, config?: GetValuesConfig): Promise<T>;

  /**
   * @deprecated use `getValues` instead
   */
  fetch<T>(path: string, config?: GetValuesConfig): Promise<T>;
}

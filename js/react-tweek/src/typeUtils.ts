import { ComponentType } from 'react';

export type Omit<T extends U, U> = Pick<T, Exclude<keyof T, keyof U>>;

export interface ComponentEnhancer<TInjectedProps> {
  <P extends TInjectedProps>(component: ComponentType<P>): ComponentType<Omit<P, TInjectedProps>>;
}

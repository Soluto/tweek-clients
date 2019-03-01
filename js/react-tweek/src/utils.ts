import { ReactType } from 'react';

export type Omit<T extends U, U> = Pick<T, Exclude<keyof T, keyof U>>;

export const getDisplayName = (Component: ReactType) => {
  if (typeof Component === 'string') {
    return Component;
  }

  if (!Component) {
    return undefined;
  }

  return Component.displayName || Component.name || 'Component';
};

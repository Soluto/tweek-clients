import { ElementType } from 'react';

export const getDisplayName = (Component: ElementType<any>) => {
  if (typeof Component === 'string') {
    return Component;
  }

  if (!Component) {
    return undefined;
  }

  return Component.displayName || Component.name || 'Component';
};

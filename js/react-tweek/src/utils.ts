import React, { ReactType } from 'react';

export const getDisplayName = (Component: ReactType<any>) => {
  if (typeof Component === 'string') {
    return Component;
  }

  if (!Component) {
    return undefined;
  }

  return Component.displayName || Component.name || 'Component';
};

export const ensureHooks = () => {
  if (typeof React.useContext === 'undefined') {
    throw new Error('hooks are not supported in this react version');
  }
};

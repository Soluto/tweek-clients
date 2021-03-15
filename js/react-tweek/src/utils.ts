import React, { ElementType } from 'react';

export const getDisplayName = (Component: ElementType) => {
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

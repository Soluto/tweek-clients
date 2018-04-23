require('object.entries').shim();
require('object.values').shim();

export * from './types';
export { default as MemoryStore } from './memory-store';
export { default as TweekRepository, TweekKeySplitJoin } from './tweek-repository';

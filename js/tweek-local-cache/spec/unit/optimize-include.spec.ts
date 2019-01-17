import { expect } from 'chai';
import { optimizeInclude } from '../../src/utils';

describe('optimize include', () => {
  it('should filter keys correctly', () => {
    const result = optimizeInclude(['a/_', 'a/b', 'a/c/_', 'b']);
    expect(result).to.deep.equal(['a/_', 'b']);
  });

  it('should handle hidden keys correctly', () => {
    const result = optimizeInclude(['@a/_', '@a/b/@c/_', '@a/b/@c/d', '@a/c', '@a/d/_', 'b/_', 'b/c', 'b/@d']);
    expect(result).to.deep.equal(['@a/_', '@a/b/@c/_', 'b/@d', 'b/_']);
  });
});

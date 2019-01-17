import { expect } from 'chai';
import { optimizeInclude } from '../../src/utils';

describe('optimize include', () => {
  it('should filter keys correctly', () => {
    const result = optimizeInclude(['a/_', 'a/b', 'a/c/_', 'b']);
    expect(result).to.deep.equal(['a/_', 'b']);
  });

  it('should not filter hidden keys', () => {
    const result = optimizeInclude(['@a/_', '@a/b', 'b/_', 'b/c/@d']);
    expect(result).to.deep.equal(['@a/_', 'b/_', 'b/c/@d']);
  });
});

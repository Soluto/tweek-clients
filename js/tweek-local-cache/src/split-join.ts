export interface SplitJoin {
  split(key: string): string[];
  join(fragments: string[]): string;
}

export class MemoizedTweekKeySplitJoin implements SplitJoin {
  private readonly _cache = new Map<string, string[]>();

  split(key: string): string[] {
    const cached = this._cache.get(key);
    if (cached) {
      return cached;
    }

    const result = key.toLowerCase().split('/');
    this._cache.set(key, result);
    return result;
  }

  join(fragments: string[]) {
    return fragments.join('/');
  }
}

export const TweekKeySplitJoin = new MemoizedTweekKeySplitJoin();

export interface SplitJoin {
  split(key: string): string[];
  join(fragments: string[]): string;
}

export const TweekKeySplitJoin: SplitJoin = {
  split(key: string) {
    return key.toLowerCase().split('/');
  },
  join(fragments: string[]) {
    return fragments.join('/');
  },
};

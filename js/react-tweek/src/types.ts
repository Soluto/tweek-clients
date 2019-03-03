import { TweekRepository } from 'tweek-local-cache';

export type Omit<T extends U, U> = Pick<T, Exclude<keyof T, keyof U>>;

export type OptionalTweekRepository = TweekRepository | undefined;

export type PrepareKey = (keyPath: string) => void;

export type UseTweekRepository = () => OptionalTweekRepository;

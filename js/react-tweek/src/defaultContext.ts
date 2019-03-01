import { createTweekContext } from './createTweekContext';

const context = createTweekContext();

export const TweekProvider = context.Provider;
export const TweekConsumer = context.Consumer;
export const prepareKey = context.prepareKey;
export const withTweekValues = context.withTweekValues;
export const useTweekRepository = context.useTweekRepository;
export const useTweekValue = context.useTweekValue;

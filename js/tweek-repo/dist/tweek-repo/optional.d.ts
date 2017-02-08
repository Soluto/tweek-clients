export default class Optional<T> {
    value: T | undefined;
    hasValue: boolean;
    constructor(...args: any[]);
    static some: <T>(value: T) => Optional<T>;
    static none: <T>() => Optional<T>;
    map: <T, U>(fn: (T: any) => U) => Optional<U>;
    flatMap: <T, U>(fn: (T: any) => Optional<U>) => Optional<U>;
    orElse: (value: T | (() => T) | null) => T | null;
    orNull: () => T | null;
}

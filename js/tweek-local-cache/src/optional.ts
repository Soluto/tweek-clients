type Fallback<T> = () => T | never;

export default class Optional<T> {
  readonly value: T | undefined = undefined;
  readonly hasValue: boolean = false;

  constructor(...args: T[]) {
    if (args.length === 1) {
      this.value = args[0];
      this.hasValue = true;
    }
  }

  static some = <T>(value: T) => new Optional<T>(value);

  static none = <T>() => new Optional<T>();

  map = <U>(fn: (value: T) => U): Optional<U> => this.flatMap(v => Optional.some(fn(v)));

  flatMap = <U>(fn: (value: T) => Optional<U>) => (this.hasValue ? fn(this.value!) : Optional.none<U>());

  orElse = (value: T | Fallback<T> | null) => {
    if (typeof value === 'function') {
      return (<Fallback<T>>value)();
    } else {
      return value;
    }
  };

  orNull = () => this.orElse(null);
}

export type Maybe<T> = T | void;

export function some<T>(it: Maybe<T>): it is T {
  return it !== null && it !== void 0;
}

export function none<T>(it: Maybe<T>): it is void {
  return it === null || it === void 0;
}

export function Some<T>(it: T): Maybe<T> {
  return it
}

export function None<T>(it: T): Maybe<T> {
  return undefined;
}

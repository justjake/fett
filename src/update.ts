// @see https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript

import { is } from 'immutable';

interface JSObj {
  [key: string]: any;
}

function assign<T extends U, U extends JSObj>(target: T, source: U): T {
  for (let id in source) {
    target[id] = source[id];
  }
  return target;
}

function isDirty<T extends U, U extends JSObj>(target: T, source: U): boolean {
  let dirty = false;
  for (let id in source) {
    dirty = dirty || !is(target[id], source[id])
  }
  return dirty;
}

export default function update<T extends U, U>(target: T, newVals: U): T {
  if (isDirty(target, newVals)) return assign(assign(<T>{}, target), newVals);
  return target;
}

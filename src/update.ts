// @see https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript

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
    dirty = dirty || target[id] !== source[id];
  }
  return dirty;
}

export default function update<T extends U, U>(target: T, newVals: U): T {
  if (isDirty(target, newVals)) return assign(assign(<T>{}, target), newVals);
  return target;
}

// maybe i should just suck it up and use Immutable.js? I installed it after all
export function map<T>(input: T[], fn: (element: T, index?: number) => T): T[] {
  let dirty = false;
  const newArray = input.map((el, idx) => {
    const newEl = fn(el, idx);
    dirty = dirty || newEl !== el;
    return newEl
  });

  if (dirty) return newArray;
  return input;
}

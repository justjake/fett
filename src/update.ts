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

export default function update<T extends U, U>(target: T, newVals: U): T {
  return assign(assign(<T>{}, target), newVals);
}

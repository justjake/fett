import { assert } from 'chai';

describe('es6 works', () => {
  it('runs without error', () => {
    class Foo {}
    class Bar extends Foo {
      constructor(a = 1, b = 2) {
        super();
        this.a = a;
        this.b = b;
      }
    }

    const b = new Bar()
    assert.strictEqual(b.a, 1)
    assert.strictEqual(b.b, 2)
  })
})

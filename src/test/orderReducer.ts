import * as assert from 'assert';
import { Request, Shard } from '../Types'
import { reducer, T } from '../reducers/order'
import { is, Range, List, Iterable } from 'immutable'
import * as orderActions from '../actions/order';

const reqs: Iterable<number, Request> = Range().map(i => ({
  userId: String(i),
  text: `I want a milk tea ${i}`,
  createdAt: new Date()
}))

function mkOrder(reqs: Iterable<number, Request> = List<Request>(), shards = List<Shard>()): T {
  const now = new Date()
  return {
    creatorId: 'jake',
    createdAt: now,
    updatedAt: now,
    info: 'example order',
    shards: shards,
    unshardedRequests: reqs.toList()
  };
}

function mkShard(reqs: Iterable<number, Request> = List<Request>(), locked = false): Shard {
  return {
    leaderId: undefined,
    label: undefined,
    locked: locked,
    ordered: false,
    delivered: false,
    requests: reqs.toList(),
  }
}

function multiShard(): T {
  const shards = List.of(
    mkShard(reqs.slice(3, 5)),
    mkShard(reqs.slice(5, 10))
  )
  return mkOrder(reqs.slice(0, 3), shards)
}

function allReqs(order: T) {
  return order.unshardedRequests.concat(order.shards.map(s => s.requests).flatten())
}

describe('reducers/order', function() {

  describe('action "make request"', function() {
    it('adds a new request to unshardedRequests', function() {
      const oldState = mkOrder()
      const req = reqs.get(0)
      const newState = reducer(oldState, orderActions.makeRequest(req))

      assert.strictEqual(oldState.unshardedRequests.size, 0, 'no requests before')
      assert.strictEqual(newState.unshardedRequests.size, 1, 'now 1 req')
    });
    it('does not add a second request for the same user', function() {
      const oldState = mkOrder(reqs.slice(0, 1))
      const req = reqs.get(0)
      const newState = reducer(oldState, orderActions.makeRequest(
        {userId: '0', text: 'bla', createdAt: new Date()}))

      assert.strictEqual(oldState.unshardedRequests.size, 1, 'one requests before')
      assert.strictEqual(newState.unshardedRequests.size, 1, 'now 1 req')
    });
  })

  describe('action "cancel order"', function() {
    it('removes the correct request from unshardedRequests', function() {
      const oldState = mkOrder(reqs.slice(0, 5).toList())
      const newState = reducer(oldState, orderActions.cancelRequest({userId: '3'}))
      assert.strictEqual(newState.unshardedRequests.size, 4, 'did remove one')
      newState.unshardedRequests.forEach(r => assert(r.userId !== '3', 'remaining id is not 3'))
      assert.strictEqual(allReqs(newState).size, allReqs(oldState).size - 1, 'one less req')
    })

    it('cancels a request inside a shard', function() {
      const oldState = multiShard();
      const newState = reducer(oldState, orderActions.cancelRequest({userId: '3'}))
      assert(
        is(oldState.unshardedRequests, newState.unshardedRequests),
        'unshardedRequests unchanged')

      assert.strictEqual(
        newState.shards.get(1),
        oldState.shards.get(1),
        'shard 1 unchanged'
      )

      assert.strictEqual(newState.shards.get(0).requests.size, 1, 'shard 0 shrank')
      assert.strictEqual(allReqs(newState).size, allReqs(oldState).size - 1, 'one less req')
    })

    it('does nothing if user has no requests', function() {
      const oldState = multiShard();
      const newState = reducer(oldState, orderActions.cancelRequest({userId: '99'}))
      assert.strictEqual(newState, oldState, 'unchanged')
    })
  })

  describe(`action "${orderActions.balanceShards.T}"`, function() {

    function sameSize(old: T, brew: T) {
      it(`has the same total number of requests (old: ${allReqs(old).size})`, function() {
        assert.strictEqual(allReqs(brew).size, allReqs(old).size, 'same num of reqs')
      })
    }

    context('no locks', function() {
      const oldState = multiShard();
      const newState = reducer(oldState, orderActions.balanceShards({maxSize: 2, userId: 'bepis'}))

      sameSize(oldState, newState)

      it('consumes all unshardedRequests', function() {
        assert.strictEqual(newState.unshardedRequests.size, 0, 'no more reqs')
      })

      it('shards all have size < max size', function() {
        newState.shards.forEach(
          (s, i) => assert.ok(s.requests.size <= 2, `bigger shard ${i}`))
      })

      it('shards all have some requests', function () {
        newState.shards.forEach(
          (s, i) => assert.ok(s.requests.size >= 1, `shard ${i} has requests`)
        )
      })
    })

    context('some locks', function() {
      const locked = mkShard(reqs.slice(2, 10), true)
      const oldState = mkOrder(
        reqs.slice(0, 2),
        List.of(
          locked,
          mkShard(reqs.slice(10, 20)),
          mkShard(reqs.slice(20, 30))
        )
      )
      const newState = reducer(oldState, orderActions.balanceShards({maxSize: 4, userId: 'bepis'}))
      const unlocked = newState.shards.filter(s => !s.locked)

      sameSize(oldState, newState)

      it('preserves the locked shard', function() {
        const newLocked = newState.shards.find(s => s.locked)
        assert.strictEqual(newLocked, locked, 'locked shard unchanged')
        assert.strictEqual(newLocked.requests.size, 8, 'still has 8 reqs')
      })

      it('has a bunch of unlocked shards', function() {
        assert.ok(unlocked.size > 2, 'yerp')
      })

      it('unlocked shards all have size < max size', function() {
        unlocked.forEach(
          (s, i) => assert.ok(s.requests.size <= 4, `bigger shard ${i}`))
      })

    })

  })
})

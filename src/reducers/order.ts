import { some, someOr, None } from '../Maybe';
import { List } from 'immutable';
import { AnyAction, UserIdentifier, Shard, Order, Request, Maybe } from '../Types';
import update from '../update';
import * as shardR from './shard';
import {
  makeRequest,
  cancelRequest,
  balanceShards
} from '../actions/order';
import { chunk, flatten } from 'lodash';

export type T = Order;

interface RequestOfUserResult {
  found: boolean;
  request: Maybe<Request>;
  shard: Maybe<Shard>;
}

const DEFAULT_SHARD_SIZE = 6;

function requestOfUser(u: UserIdentifier, order: Order): RequestOfUserResult {
  // let's check unsharded requests first
  function findIn(a: List<Request>) { return a.find((req: Request) => req.userId === u.userId) }
  const inUnsharded = findIn(order.unshardedRequests)
  if (inUnsharded) {
    return {
      found: true,
      request: inUnsharded,
      shard: undefined,
    }
  }

  for (let i = order.shards.size - 1; i >= 0; i--) {
    const curShard = order.shards.get(i);
    const inShard = findIn(curShard.requests);

    if (inShard) {
      return {
        found: true,
        request: inShard,
        shard: curShard,
      };
    }
  }

  // missed
  return {
    found: false,
    request: undefined,
    shard: undefined,
  };
}

export function reducer(state: T, action: AnyAction): T {
  if (makeRequest.match(action)) {
    const { found } = requestOfUser(action.payload, state);
    // do not allow more than one order per person
    if (found) return state;
    return update(state, {unshardedRequests: state.unshardedRequests.push(action.payload)})
  }

  if (cancelRequest.match(action)) {
    const { found, shard } = requestOfUser(action.payload, state);
    if (!found) return state;
    const userId = action.payload.userId;
    if (!shard) {
      return update(state, {unshardedRequests: state.unshardedRequests.filter(r => r.userId !== userId)})
    }
    let cannotRemove = false;
    // update each shard to potentially drop that request
    return update(
      state,
      {shards: state.shards.map(
        shard => {
          // TODO: should we allow removes when unlocked, but prevent them when ordered?
          if (shard.locked) {
            cannotRemove = true
            return shard
          }
          return update(shard, {requests: shard.requests.filter(r => r.userId !== userId)})
        }
      )}
    )
  }

  if (balanceShards.match(action)) {
    // this is gonna get complicated, fast.
    // first, get a list of all the requests
    const unlockedShards = state.shards.filter(shard => !shard.locked)
    const requests = state.unshardedRequests.concat(unlockedShards.map(s => s.requests))

    const maxSizeForCurrent = unlockedShards.size != 0 ?
      Math.floor(requests.size / unlockedShards.size) :
      DEFAULT_SHARD_SIZE;
    const maxSize = someOr(action.payload.maxSize, maxSizeForCurrent)
    // TODO: it would be nice to try to move requests between shards as little as possible.
    // and to prefer to iliminate shards that have the fewest or least active people.
    // instead, do the simplest thing that could possibly work - by creating all-new shards
    const chunks = chunk(requests.toJS(), maxSize)
    const resultShards = List<Shard>(
      chunks.map(chunk => {return {
        leaderId: undefined,
        label: undefined,
        locked: false,
        ordered: false,
        delivered: false,
        requests: List<Request>(chunk),
      }})
      // TODO: put locked shards at the front?
    ).concat(state.shards.filter(shard => shard.locked))

    return update(state, {
      unshardedRequests: List<Request>(),
      shards: resultShards,
    });
  }

  // dispatch other actions to all the shards
  const newShards = state.shards.map(shard => shardR.reducer(shard, action));
  return update(state, {shards: newShards});
}

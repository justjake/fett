import { AnyAction, UserIdentifier, Shard, Order, Request, Maybe } from '../Types';
import update from '../update';
import * as shard from './shard';
import {
  makeRequest,
  cancelRequest,
  balanceShards
} from '../actions/order';
import { flatten } from 'lodash';

export type T = Order;

interface RequestOfUserResult {
  found: boolean;
  request: Maybe<Request>;
  shard: Maybe<Shard>;
}

function requestOfUser(u: UserIdentifier, order: Order): RequestOfUserResult {
  // let's check unsharded requests first
  function findInArray(a: Array<Request>) { return a.find((req: Request) => req.userId === u.userId) }
  const inUnsharded = findInArray(order.unshardedRequests)
  if (inUnsharded) {
    return {
      found: true,
      request: inUnsharded,
      shard: undefined,
    }
  }

  for (let i = order.shards.length - 1; i >= 0; i--) {
    const curShard = order.shards[i];
    const inShard = findInArray(curShard.requests);

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
    return update(state, {unshardedRequests: [...state.unshardedRequests, action.payload]})
  }

  return state;
}

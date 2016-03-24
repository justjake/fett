import { Shard, AnyAction } from '../Types';
import { some, Some } from '../Maybe';
import update from '../update';
import {
  electLeader,
  unlockShard,
  lockShard,
  orderShard,
  deliverShard
} from '../actions/shard';

export type T = Shard;

export function reducer(state: Shard, action: AnyAction): Shard {
  function actorIsLeader() {
    if (some(state.leaderId)) {
      return state.leaderId === <string>action.payload.userId;
    }
    return false;
  }

  if (electLeader.match(action)) {
    const { userId } = action.payload;
    // do we need to make sure the user is in the shard? could a shard leader
    // have no order? that would be horrible. Shard leaders must have an order.
    // Boba is good for you.
    const hasUser = state.requests.filter(r => r.userId === userId).length > 0;
    if (hasUser) return update(state, {leaderId: Some(action.payload.userId)});
  }

  if (lockShard.match(action) && actorIsLeader()) {
    return update(state, {locked: true});
  }

  if (unlockShard.match(action) && actorIsLeader()) {
    if (state.ordered) return state;
    return update(state, {locked: false})
  }

  if (orderShard.match(action) && actorIsLeader()) {
    if (state.ordered) return state;
    if (state.delivered) return state;
    return update(state, {locked: true, ordered: true, delivered: false});
  }

  if (deliverShard.match(action) && actorIsLeader()) {
    return update(state, {delivered: true});
  }

  return state;
}

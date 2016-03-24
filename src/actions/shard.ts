import { makeAction } from '../Actions';
import { SlackId } from '../Types';

type ShardAction = 'elect leader'
  | 'lock shard' // prevent modifications to this shard
  | 'unlock shard' // allow modifications to this shard
  | 'order shard' // indicate that this shard is ordered from store
  | 'deliver shard'; // indicate that this shard is delivered from store

// shards only perform the action if this userId has a request in the shard
interface ShardPayload {
  userId: SlackId;
}

// now we can generate many action creators without too much type bloat
export const electLeader = makeAction<ShardAction, ShardPayload>('elect leader');
export const lockShard = makeAction<ShardAction, ShardPayload>('lock shard');
export const unlockShard = makeAction<ShardAction, ShardPayload>('unlock shard');
export const orderShard = makeAction<ShardAction, ShardPayload>('order shard');
export const deliverShard = makeAction<ShardAction, ShardPayload>('deliver shard');

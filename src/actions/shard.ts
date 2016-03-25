import { makeAction } from '../Actions';
import { SlackId, UserIdentifier } from '../Types';

type ShardAction = 'elect leader'
  | 'lock shard' // prevent modifications to this shard
  | 'unlock shard' // allow modifications to this shard
  | 'order shard' // indicate that this shard is ordered from store
  | 'deliver shard'; // indicate that this shard is delivered from store

// shards only perform the action if this userId has a request in the shard

// now we can generate many action creators without too much type bloat
export const electLeader = makeAction<ShardAction, UserIdentifier>('elect leader');
export const lockShard = makeAction<ShardAction, UserIdentifier>('lock shard');
export const unlockShard = makeAction<ShardAction, UserIdentifier>('unlock shard');
export const orderShard = makeAction<ShardAction, UserIdentifier>('order shard');
export const deliverShard = makeAction<ShardAction, UserIdentifier>('deliver shard');

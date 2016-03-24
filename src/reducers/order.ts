import { AnyAction, Order } from '../Types';
import * as shard from './shard';

export type T = Order;

export function reducer(state: T, action: AnyAction): T {
  let changed = false;
  const newShards = state.shards.map(old => {
    const neu = shard.reducer(old, action);
    changed = changed || (old !== neu);
    return neu;
  });

  return {
    creatorId: 'what',
    createdAt: new Date(),
    updatedAt: new Date(),
    info: 'what',
    shards: [],
  };
}

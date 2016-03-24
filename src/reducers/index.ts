import { AnyAction } from '../Types';
import * as usersById from './usersById';
import * as order from './order';

export interface T {
  ordersByChannelId: {[channel: string]: order.T};
  usersById: usersById.T;
}

export function reducer(state: T, action: AnyAction): T {
  return {
    usersById: usersById.reducer(state.usersById, action),
    ordersByChannelId: {},
  }
}

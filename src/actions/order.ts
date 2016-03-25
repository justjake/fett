import { Maybe, Request, UserIdentifier } from '../Types';
import { makeAction } from '../Actions';

interface BalanceShards extends UserIdentifier {
  maxSize: Maybe<number>;
}

type OrderAction = 'make request'
  | 'cancel request'
  | 'balance shards'

export const makeRequest = makeAction<OrderAction, Request>('make request');
export const cancelRequest = makeAction<OrderAction, UserIdentifier>('cancel request');
export const balanceShards = makeAction<OrderAction, BalanceShards>('balance shards');

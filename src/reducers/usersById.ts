import update from '../update';
import { AnyAction } from '../Actions';
import { SlackId, User } from '../Types'
import { createUser } from '../actions/user';

export interface T {
  [slackId: string]: User;
}

export function reducer(state: T, action: AnyAction): T {
  if (createUser.match(action)) {
    const user = action.payload;
    return update(state, {[user.slackId]: user});
  }
  return state;
}

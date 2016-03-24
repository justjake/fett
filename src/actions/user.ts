import { makeAction } from '../Actions';
import { User } from '../Types';

type UserActions = 'create user';

export const createUser = makeAction<UserActions, User>('create user');

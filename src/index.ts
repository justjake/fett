// I guess we need some types

enum UserActions {
  CREATE,
}

enum OrderActions {
  CREATE,
  ADD_REQUEST,
  ADD_REQUEST_INTO_SHARD,
  CANCEL_REQUEST,
  BALANCE_SHARDS_WITH_SIZE,
}

enum ShardActions {
  ELECT_LEADER,
  LOCK,  // pervent more people from adding orders to this shard
  ORDER, // indicate that this shard is ordered
  DELIVER, // indicate that this shard is delivered
}

enum OrderState {
  OPEN,
  LOCKED,
  ORDERED,
  DELIVERED,
}

// ok, how about some models
interface User {
  name: string;
  slackId: string;
  // record when user last spoke
  lastSpokeAt?: Date;
  // record when user last spoke to bot
  lastSpokeToBot?: Date;
  // TODO: record some more intelligent data here so we can figure out who
  // the most talkitive users are, and elect them as shard leaders.
}

interface Order {
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  // free field. put the name of the place, a menu link, whatever here.
  info: string;
  // there should initially be 1 shard, but it may be ballenced into many shards
  shards: Shard[];
}

interface Shard {
  leaderId?: string;
  label?: string; // helpful for shard codenames
  requests: Request[];
  state: OrderState;
}

// something like {userId: 1234, text: "black boba tea with no milk, 20% sweet"}
interface Request {
  userId: string;
  text: string;
}

interface IAction<TypeT, PayloadT> {
  type: TypeT;
  payload: PayloadT;
}

type AnyAction = IAction<any, any>;

interface ActionModule<TypeT, PayloadT> {
  // action creator
  (payload: PayloadT): IAction<TypeT, PayloadT>;
  // type assertion. provides type safety inside a reducer
  match(action: AnyAction): action is IAction<TypeT, PayloadT>;
  // string constant of the type
  T: TypeT;
}

function action<TypeT, PayloadT>(typestring: TypeT): ActionModule<TypeT, PayloadT> {
  const m = <ActionModule<TypeT, PayloadT>>function(payload: PayloadT): IAction<TypeT, PayloadT> {
    return {
      type: typestring,
      payload: payload
    };
  }

  m.T = typestring;
  m.match = function(action: IAction<any,any>): action is IAction<TypeT, PayloadT> {
    return action.type === typestring;
  }
  return m;
}


// ok, so an action definition looks like this
// here, we re-use the User model type, instead of inventing a specific payload type
type CreateUser = 'create user';
type Action = IAction<any, any>;
const createUser = action<CreateUser, User>('create user');

// here's how you dispatch the action:
// store.dispatch(createUser(user))

// here's how you do a reducer
// TODO replace state: any with state: Immutable.Bepis
function usersById(state: any, action: Action): any {
  if (createUser.match(action)) {
    // ok, action is now IAction<CreateUser, User> in this scope
    // ...
  }
  return state;
}

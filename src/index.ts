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

type Maybe<T> = T | void;
function some<T>(it: Maybe<T>): it is T {
  return it !== null && it !== void 0;
}
function none<T>(it: Maybe<T>): it is void {
  return it === null || it === void 0;
}
function Some<T>(it: T): Maybe<T> {
  return it
}
function None<T>(it: T): Maybe<T> {
  return undefined;
}

// ok, how about some models
interface User {
  name: string;
  slackId: string;
  // record when user last spoke
  lastSpokeAt: Maybe<Date>;
  // record when user last spoke to bot
  lastSpokeToBot: Maybe<Date>;
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
  leaderId: Maybe<string>;
  label: Maybe<string>; // helpful for shard codenames
  requests: Request[];
  locked: boolean;
  ordered: boolean;
  delivered: boolean;
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
  m.match = function(action: AnyAction): action is IAction<TypeT, PayloadT> {
    return action.type === typestring;
  }
  return m;
}


// ok, so an action definition looks like this
// here, we re-use the User model type, instead of inventing a specific payload type
type CreateUser = 'create user';
const createUser = action<CreateUser, User>('create user');

// here's how you dispatch the action:
// store.dispatch(createUser(user))

// here's how you do a reducer
// TODO replace state: any with state: Immutable.Bepis
function usersById(state: any, action: AnyAction): any {
  if (createUser.match(action)) {
    // ok, action is now IAction<CreateUser, User> in this scope
    // ...
  }
  return state;
}

// application of union types possible here
type ShardAction = 'elect leader'
  | 'lock shard' // prevent modifications to this shard
  | 'unlock shard' // allow modifications to this shard
  | 'order shard' // indicate that this shard is ordered from store
  | 'deliver shard'; // indicate that this shard is delivered from store

// shards only perform the action if this userId has a request in the shard
interface ShardPayload {
  userId: string;
}

// now we can generate many action creators without too much type bloat
const electLeader = action<ShardAction, ShardPayload>('elect leader');
const lockShard = action<ShardAction, ShardPayload>('lock shard');
const unlockShard = action<ShardAction, ShardPayload>('unlock shard');
const orderShard = action<ShardAction, ShardPayload>('order shard');
const deliverShard = action<ShardAction, ShardPayload>('deliver shard');

// @see https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript
interface Obj {
  [key: string]: any;
}

function assign<T extends U, U extends Obj>(target: T, source: U): T {
  for (let id in source) {
    target[id] = source[id];
  }
  return target;
}

function update<T extends U, U>(target: T, newVals: U): T {
  return assign(assign(<T>{}, target), newVals);
}

function shard(state: Shard, action: AnyAction): Shard {
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

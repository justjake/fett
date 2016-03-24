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

interface Action<ActionT, PayloadT> {
  type: ActionT;
  payload: PayloadT;
}

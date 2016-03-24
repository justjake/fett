import { Maybe } from './Maybe';
import { AnyAction } from './Actions';

/**
   this file holds all the unadorned interface types
*/

export type SlackId = string;

export interface User {
  name: string;
  slackId: SlackId;
  // record when user last spoke
  lastSpokeAt: Maybe<Date>;
  // record when user last spoke to bot
  lastSpokeToBot: Maybe<Date>;
  // TODO: record some more intelligent data here so we can figure out who
  // the most talkitive users are, and elect them as shard leaders.
}

export interface Order {
  creatorId: SlackId;
  createdAt: Date;
  updatedAt: Date;
  // free field. put the name of the place, a menu link, whatever here.
  info: string;
  // there should initially be 1 shard, but it may be ballenced into many shards
  shards: Shard[];
}

export interface Shard {
  leaderId: Maybe<SlackId>;
  label: Maybe<string>; // helpful for shard codenames
  requests: Request[];
  locked: boolean;
  ordered: boolean;
  delivered: boolean;
}

// something like {userId: 1234, text: "black boba tea with no milk, 20% sweet"}
interface Request {
  userId: SlackId;
  text: string;
}

// derf?
export type AnyAction = AnyAction;

import { Maybe } from './Maybe';
import { AnyAction } from './Actions';
import { Map, List } from 'immutable';

/**
   this file holds all the unadorned interface types
*/

export type SlackId = string;

export interface UserIdentifier {
  userId: string;
}

export interface User extends UserIdentifier {
  name: string;
  // will just be the slack id, for now
  userId: string;
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
  // TODO: switch to Immutable.js collections
  shards: List<Shard>;
  // ugh
  unshardedRequests: List<Request>;
}

export interface Shard {
  leaderId: Maybe<SlackId>;
  label: Maybe<string>; // helpful for shard codenames
  requests: List<Request>;
  locked: boolean;
  ordered: boolean;
  delivered: boolean;
}

// something like {userId: 1234, text: "black boba tea with no milk, 20% sweet"}
export interface Request extends UserIdentifier {
  text: string;
  createdAt: Date;
}

// derf?
export type AnyAction = AnyAction;

export type Maybe<T> = Maybe<T>;

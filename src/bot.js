/* entrypoint */
import SlackRobot from 'slack-robot'
import Persistance from 'persistance'
import { createStore } from 'redux'
import { createAction, handleActions } from 'redux-action'

// possible channel states
const IDLE = 'idle'
const UNSHARDED_ORDER = 'unsharded order'
const SHARDED_ORDER = 'sharded order'

// possible shard states
const SHARD_OPEN = 'shard open'
const SHARD_LOCKED = 'shard locked'
const SHARD_ORDERED = 'shard ordered'
const SHARD_DELIVERED = 'shard delivered'

function reducer(state = {}, {type, payload}) {

}

const SHARD_INITIAL_STATE = {
  leaderId: null,
  requests: [],
  state: SHARD_OPEN,
};


function main() {
  const slackToken = process.env.SLACK_TOKEN
  const persistDir = process.env.PERSIST
  const slackBot = new SlackRobot(slackToken)
}


if (require.main === module) {
  main()
}

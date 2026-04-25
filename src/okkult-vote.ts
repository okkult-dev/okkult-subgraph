import {
  PollCreated,
  VoteCast,
  PollTallied
} from '../generated/OkkultVote/OkkultVote'
import {
  Poll,
  VoteEvent,
  ProtocolStats
} from '../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

// ── Helper: get or create ProtocolStats ───────────────────
function getOrCreateStats(): ProtocolStats {
  let stats = ProtocolStats.load('global')

  if (!stats) {
    stats = new ProtocolStats('global')
    stats.totalProofs    = BigInt.fromI32(0)
    stats.totalShields   = BigInt.fromI32(0)
    stats.totalUnshields = BigInt.fromI32(0)
    stats.totalTransfers = BigInt.fromI32(0)
    stats.totalVotes     = BigInt.fromI32(0)
    stats.totalPolls     = BigInt.fromI32(0)
    stats.uniqueProvers  = BigInt.fromI32(0)
    stats.lastUpdated    = BigInt.fromI32(0)
  }

  return stats
}

// ── Event Handler: PollCreated ────────────────────────────
export function handlePollCreated(event: PollCreated): void {

  // 1. Create poll entity
  const poll = new Poll(event.params.pollId.toString())

  poll.title       = event.params.title
  poll.voterRoot   = event.params.voterRoot
  poll.startTime   = event.params.startTime
  poll.endTime     = event.params.endTime
  poll.totalVotes  = BigInt.fromI32(0)
  poll.totalYes    = BigInt.fromI32(0)
  poll.totalNo     = BigInt.fromI32(0)
  poll.tallied     = false
  poll.coordinator = event.transaction.from
  poll.createdAt   = event.block.timestamp
  poll.save()

  // 2. Update protocol stats
  const stats = getOrCreateStats()
  stats.totalPolls  = stats.totalPolls.plus(BigInt.fromI32(1))
  stats.lastUpdated = event.block.timestamp
  stats.save()
}

// ── Event Handler: VoteCast ───────────────────────────────
export function handleVoteCast(event: VoteCast): void {

  // 1. Save vote event entity
  const vote = new VoteEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  vote.poll          = event.params.pollId.toString()
  vote.encryptedVote = event.params.encryptedVote
  vote.nullifier     = event.params.nullifier
  vote.timestamp     = event.block.timestamp
  vote.txHash        = event.transaction.hash
  vote.save()

  // 2. Update poll vote count
  const poll = Poll.load(event.params.pollId.toString())
  if (poll) {
    poll.totalVotes = poll.totalVotes.plus(BigInt.fromI32(1))
    poll.save()
  }

  // 3. Update protocol stats
  const stats = getOrCreateStats()
  stats.totalVotes  = stats.totalVotes.plus(BigInt.fromI32(1))
  stats.lastUpdated = event.block.timestamp
  stats.save()
}

// ── Event Handler: PollTallied ────────────────────────────
export function handlePollTallied(event: PollTallied): void {

  // 1. Update poll with tally results
  const poll = Poll.load(event.params.pollId.toString())

  if (poll) {
    poll.totalYes   = event.params.totalYes
    poll.totalNo    = event.params.totalNo
    poll.totalVotes = event.params.totalVotes
    poll.tallied    = true
    poll.save()
  }

  // 2. Update protocol stats
  const stats = getOrCreateStats()
  stats.lastUpdated = event.block.timestamp
  stats.save()
}

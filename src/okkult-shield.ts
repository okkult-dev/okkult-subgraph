import {
  Shielded,
  Unshielded,
  PrivateTransfer
} from '../generated/OkkultShield/OkkultShield'
import {
  ShieldEvent,
  UnshieldEvent,
  PrivateTransferEvent,
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

// ── Event Handler: Shielded ───────────────────────────────
export function handleShielded(event: Shielded): void {

  // 1. Save shield event entity
  const shield = new ShieldEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  shield.commitment  = event.params.commitment
  shield.leafIndex   = event.params.leafIndex
  shield.token       = event.params.token
  shield.fee         = event.params.fee
  shield.blockNumber = event.block.number
  shield.timestamp   = event.block.timestamp
  shield.txHash      = event.transaction.hash
  shield.save()

  // 2. Update protocol stats
  const stats = getOrCreateStats()
  stats.totalShields = stats.totalShields.plus(BigInt.fromI32(1))
  stats.lastUpdated  = event.block.timestamp
  stats.save()
}

// ── Event Handler: Unshielded ─────────────────────────────
export function handleUnshielded(event: Unshielded): void {

  // 1. Save unshield event entity
  const unshield = new UnshieldEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  unshield.nullifier  = event.params.nullifier
  unshield.recipient  = event.params.recipient
  unshield.token      = event.params.token
  unshield.amount     = event.params.amount
  unshield.timestamp  = event.block.timestamp
  unshield.txHash     = event.transaction.hash
  unshield.save()

  // 2. Update protocol stats
  const stats = getOrCreateStats()
  stats.totalUnshields = stats.totalUnshields.plus(BigInt.fromI32(1))
  stats.lastUpdated    = event.block.timestamp
  stats.save()
}

// ── Event Handler: PrivateTransfer ────────────────────────
export function handlePrivateTransfer(event: PrivateTransfer): void {

  // 1. Save private transfer event entity
  const transfer = new PrivateTransferEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  transfer.inNullifier    = event.params.inNullifier
  transfer.outCommitment1 = event.params.outCommitment1
  transfer.outCommitment2 = event.params.outCommitment2
  transfer.timestamp      = event.block.timestamp
  transfer.txHash         = event.transaction.hash
  transfer.save()

  // 2. Update protocol stats
  const stats = getOrCreateStats()
  stats.totalTransfers = stats.totalTransfers.plus(BigInt.fromI32(1))
  stats.lastUpdated    = event.block.timestamp
  stats.save()
}

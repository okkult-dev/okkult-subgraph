import {
  ProofVerified
} from '../generated/OkkultVerifier/OkkultVerifier'
import {
  ComplianceProof,
  ProtocolStats
} from '../generated/schema'
import { BigInt, Bytes } from '@graphprotocol/graph-ts'

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

// ── Event Handler: ProofVerified ──────────────────────────
export function handleProofVerified(event: ProofVerified): void {

  // 1. Save compliance proof entity
  const proof = new ComplianceProof(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  proof.prover      = event.params.prover
  proof.nullifier   = event.params.nullifier
  proof.validUntil  = event.params.validUntil
  proof.blockNumber = event.block.number
  proof.timestamp   = event.block.timestamp
  proof.txHash      = event.transaction.hash
  proof.save()

  // 2. Update protocol stats
  const stats = getOrCreateStats()
  stats.totalProofs = stats.totalProofs.plus(BigInt.fromI32(1))
  stats.lastUpdated = event.block.timestamp
  stats.save()
}

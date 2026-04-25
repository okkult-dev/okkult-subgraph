# okkult-subgraph

```bash
$ cat description.txt
> The Graph subgraph for Okkult Protocol.
> Indexes all on-chain events from Ethereum Mainnet.
```

---

## Setup

```bash
git clone https://github.com/okkult-dev/okkult-subgraph
cd okkult-subgraph
npm install

# Authenticate with The Graph Studio
graph auth --studio YOUR_DEPLOY_KEY

# Generate types
npm run codegen

# Build
npm run build

# Deploy
npm run deploy
```

---

## Queries

```graphql
# Get protocol stats
{
  protocolStats(id: "global") {
    totalProofs
    totalShields
    totalUnshields
    totalVotes
    uniqueProvers
    lastUpdated
  }
}

# Get recent compliance proofs
{
  complianceProofs(
    first: 10
    orderBy: timestamp
    orderDirection: desc
  ) {
    prover
    nullifier
    validUntil
    timestamp
    txHash
  }
}

# Get recent shields
{
  shieldEvents(
    first: 10
    orderBy: timestamp
    orderDirection: desc
  ) {
    commitment
    leafIndex
    token
    fee
    timestamp
  }
}
```

---

## Part of Okkult Protocol

```bash
$ cat ecosystem.txt
> okkult-proof      Core ZK compliance circuit
> okkult-sdk        TypeScript SDK
> okkult-contracts  Smart contracts
> okkult-circuits   ZK circuits
> okkult-app        Frontend
> okkult-subgraph   ← you are here
> okkult-docs       Documentation
```

---

## License

```bash
$ cat license.txt
> MIT — okkult.io · @Okkult_
```

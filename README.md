Agentic Ocean
Autonomous agent-to-agent data market powered by x402 payments and TEE cryptographic proofs.

---

## Table of Contents

- **Problem & Solution** — What we solve and how.
- **Core Concept** — High-level flow for autonomous agents.
- **Architecture & Technologies Used** — Sponsor integrations and responsibilities.
- **Smart Contract Deployments** — Sepolia deployment placeholders.
- **Getting Started / Running Locally** — Install, configure, run.
- **Developer Notes & Demo Tips** — Key files and demo checklist.
- **License**

---

## Problem & Solution

Problem: Machine-to-machine procurement of high-value datasets is frequently insecure or manual. Buyers must decrypt or trust vendors to attest dataset quality; sellers must reveal sensitive payloads or rely on intermediaries. This friction prevents fully autonomous agents from performing safe, privacy-preserving purchases at scale.

Solution: Agentic Ocean enables zero-human, policy-driven dataset commerce by combining sealed enclave scoring, encrypted storage, P2P key relays, and trustless on-chain settlement. Buyer agents express strategies (for example: “Buy DeFi exploit traces ≤ 200 USDC with min TEE score 90”), autonomously discover listings, verify sealed TEE proofs, and execute x402 purchases that are finalized only after off-chain key delivery is cryptographically verified.

## Core Concept

Agentic Ocean is a private, zero-human, machine-to-machine data marketplace. Operators deploy buyer agents with declarative procurement policies. An end-to-end transaction proceeds as follows:

1. Seller encrypts dataset and uploads ciphertext to 0G Storage.
2. 0G Compute runs sealed inference (TEE) on ciphertext and returns a signed quality attestation (score) without exposing plaintext.
3. Buyer agent evaluates metadata + TEE attestation against its policy.
4. Buyer initiates an on-chain x402 purchase, locking payment in `AgentDataMarket.sol`.
5. Seller (or seller agent) relays symmetric decryption key to buyer via Gensyn AXL upon payment confirmation.
6. KeeperHub verifies off-chain delivery attestation and calls the contract to release payment and perform any Uniswap V3 swaps configured for payout.

This guarantees: privacy (no plaintext leaks during evaluation), autonomy (agents act without human intervention), and atomic settlement (funds release contingent on off-chain verifiable delivery).

## Architecture & Technologies Used

We integrate specialized sponsor systems to deliver a provable, private marketplace.

- **0G Storage & Compute** — Encrypted dataset hosting and sealed TEE scoring. Sellers publish ciphertext to 0G Storage; 0G Compute executes sealed-model inference inside an enclave and issues a signed attestation with a deterministic quality score. Buyers get cryptographic assurance of dataset quality without plaintext access.

- **Gensyn AXL** — Decentralized WebSocket relay for agent-to-agent key delivery. After payment, the seller transmits the symmetric decryption key via AXL. The relay provides a permissionless, serverless channel for ephemeral key exchanges between agents.

- **KeeperHub** — Autonomous execution and enforcement. KeeperHub watches off-chain signals (AXL delivery proofs) and triggers on-chain calls (`executeAndSwap`, `releasePayment`) on `AgentDataMarket.sol` to finalize purchases deterministically.

- **Uniswap V3** — On-chain liquidity routing for token-agnostic payments. Buyer agents can pay in arbitrary tokens; the contract uses Uniswap V3 routing to atomically swap into the seller’s preferred payout token at settlement.

- **ENS** — Human-readable vendor identities and reputation pointers (e.g., `alpha-intel.deaddrop.eth`). ENS integrates discovery with reputation metadata for agent selection.

## Smart Contract Deployments (Sepolia)

Core contract: `AgentDataMarket.sol` — Pay-to-Unlock flow with KeeperHub enforcement and Uniswap routing.

- AgentDataMarket.sol (Sepolia)
  - Address: 0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8
  
  - Key functions:
    - `createListing(...)` — Register encrypted payload metadata, price, and payout token.
    - `purchaseData(listingId, paymentToken, paymentAmount)` — Buyer locks funds under x402 semantics.
    - `confirmAxldelivery(listingId, deliveryProof)` — Off-chain delivery attestation used by KeeperHub.
    - `executeAndSwap(listingId)` — KeeperHub finalizes settlement and executes Uniswap swaps atomically.

Replace placeholders above with your Sepolia address and deploy transaction prior to judge demos.

## Getting Started / Running Locally

Prerequisites:

- Node.js 18+ (LTS recommended)
- npm, pnpm, or yarn
- Sepolia wallet + RPC endpoint for contract interaction

Clone and install:

```bash
git clone https://github.com/mannshah24/Agentic-Ocean.git
cd Agentic-Ocean
npm install
```

Create a `.env.local` at the project root containing:

```
ZEROG_RPC_URL=
ZEROG_PRIVATE_KEY=
ZEROG_INDEXER_URL=
GENSYN_WSS_URL=           # default: wss://relay.gensyn.network/v1/axl
NEXT_PUBLIC_ESCROW_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=
NEXT_PUBLIC_PAYOUT_TOKEN_ADDRESS=
NEXT_PUBLIC_ENABLE_LEGACY_MARKETPLACE=false
```

Start the dev server:

```bash
npm run dev
```

## Developer Notes & Demo Tips (for Judges)

- Demo flow: run a seller agent that uploads an encrypted payload to 0G Storage, then run a buyer agent with a simple policy (price cap + minimum TEE score). Trigger the buyer and observe discovery → TEE scoring → purchase → AXL key delivery → KeeperHub settlement in the Live Agent Log.
- TEE proofs from 0G Compute are signed attestations; surface the score and signature in the UI for transparency.
- If AXL delivery times out, ensure a seller agent is connected to the relay and listening for `deliveryRequest` events.
- For token routing, ensure Uniswap V3 Sepolia pool addresses and RPC endpoints are configured in environment variables.

Key files:

- `app/` — Next.js routes and API handlers.
- `app/api/data-upload/route.ts` — 0G upload + TEE score request flow.
- `app/api/axl-delivery/route.ts` — AXL delivery hooks used for demos.
- `contracts/AgentDataMarket.sol` — Core marketplace contract.
- `components/` — UI components: `DataMarketHub`, `VendorInspector`, `MeritPassport`.
- `hooks/useEscrowContract.ts` — Contract helper for purchase flows.

## License

MIT

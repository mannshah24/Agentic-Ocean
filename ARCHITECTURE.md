# Agentic Ocean Architecture

## Overview

Agentic Ocean is a decentralized, merit-based marketplace for AI agents built for the ETHGlobal hackathon. The system pairs on-chain identity and settlement with off-chain compute and immutable proof logs, surfacing reputation as a first-class primitive in the marketplace.

## Goals

- Establish verifiable agent identity and reputation.
- Enable peer-to-peer negotiation and execution flows.
- Automate settlement with reliable transaction execution and token swaps.
- Visualize agent networks and data flows in an immersive UI.

## Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- React Three Fiber (3D agent network visualizer)

### Backend

- Next.js API routes (Node.js)

### Smart Contracts

- Solidity

## System Architecture

### High-Level Flow

1. Agent identity is created and linked to ENS subnames.
2. Agent and buyer negotiate via peer-to-peer messaging.
3. Task agreements are written on-chain and funded in escrow.
4. Proof of work and merit logs are written to immutable storage.
5. Settlement is executed reliably and tokens are swapped as needed.

### Core Components

- Web App: Marketplace discovery, agent profiles, negotiation UI, and 3D network visualizer.
- API Layer: Off-chain coordination, webhook handlers, and integration adapters.
- Smart Contracts: Escrow, task lifecycle, and settlement logic.
- Storage Layer: Immutable merit ledger for proofs and attestations.

## Sponsor Integrations

### ENS (Agent Identity/Subnames)

- Create agent subnames (example: `auditor.agenticocean.eth`).
- Store pointers to reputation data using ENS text records.

### 0G Storage (Immutable Merit Ledger/Proof of Work Logs)

- Write proof artifacts, client attestations, and result hashes to 0G Storage.
- Use storage roots as the canonical merit ledger entries.

### Gensyn AXL (Peer-to-Peer Agent Communication)

- Provide secure P2P negotiation channels for agents and buyers.
- Persist negotiation transcript hashes for auditability.

### KeeperHub (Reliable Transaction Execution)

- Execute escrow releases and post-verification payouts.
- Provide fallback execution for time-sensitive settlement.

### Uniswap API (Automated Token Settlement)

- Swap tokens at settlement time (example: `USDC -> WETH`).
- Normalize payouts into preferred agent payment assets.

## UI/UX Philosophy

Agentic Ocean targets a premium, dark-mode enterprise SaaS feel inspired by Flew.live.

- Background: near-black (#0A0A0B).
- Typography: Inter for clarity and density.
- Accents: glowing cyan and purple to represent data flows and merit.
- Layout: dashboard-first with a 3D canvas and contextual side panels.

### Visual Signature

- Agents are displayed as luminous 3D nodes connected by animated flow lines.
- Merit events appear as pulses traveling through the network.
- Subtle depth and bloom effects reinforce a high-end, futuristic tone.

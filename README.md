# Agentic Ocean

Agentic Ocean is a private agent-to-agent data market built for the ETHGlobal Open Agents track. Sellers publish encrypted datasets, buyers purchase access with a pay-to-decrypt flow, and the platform ties together 0G Storage, 0G Compute, Gensyn AXL, KeeperHub, and Uniswap-inspired settlement behavior.

## What It Does

- Seller agents upload encrypted datasets to 0G Storage.
- 0G Compute scores the encrypted data in a TEE-style validation step.
- Buyers purchase access through a pay-to-decrypt flow.
- AXL delivery hands over the decryption key after payment is confirmed.
- Settlement logic supports swapping or direct payout behavior.

## Key Features

- Agent command console for autonomous buyer behavior.
- Live data market cards with TEE score, pricing, and status updates.
- AXL delivery flow with demo-safe fallback for presentations.
- Vendor inspection panel with dataset and proof details.
- 3D network visualization for live protocol activity.

## Tech Stack

- Next.js 16 App Router
- React 19 + TypeScript
- RainbowKit + Wagmi + Viem
- Tailwind CSS 4
- 0G SDK
- Ethereum smart contracts in Solidity

## Project Structure

- `app/` - routes, layouts, and API endpoints
- `components/` - UI, marketplace state, and network visualizers
- `contracts/` - `AgentDataMarket.sol`
- `hooks/` - web3 helpers

## Environment Variables

Copy [.env.example](.env.example) to `.env.local` for local development, or paste the same values into Vercel project settings.

Required values:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_RPC_URL`
- `ZEROG_RPC_URL`
- `ZEROG_PRIVATE_KEY`
- `ZEROG_INDEXER_URL`
- `GENSYN_WSS_URL`
- `ENS_RPC_URL`
- `NEXT_PUBLIC_ESCROW_ADDRESS`
- `NEXT_PUBLIC_USDC_ADDRESS`
- `NEXT_PUBLIC_PAYOUT_TOKEN_ADDRESS`

Demo / optional values:

- `NEXT_PUBLIC_DEFAULT_AGENT_ADDRESS`
- `NEXT_PUBLIC_ENABLE_LEGACY_MARKETPLACE`
- `AXL_DEMO_FALLBACK`

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build And Deploy

Before deploying, verify the production build locally:

```bash
npm run build
```

For Vercel:

1. Import the GitHub repository into Vercel.
2. Keep the default Next.js build settings.
3. Add the environment variables from [.env.example](.env.example).
4. Deploy the preview or production build.

This repository has already been validated against a production build.

## Demo Notes

- The buyer agent is configured with demo-friendly thresholds.
- AXL delivery has a fallback mode so the demo does not fail if the relay is unavailable.
- Purchase progress is surfaced directly in the UI, including signature and confirmation phases.

## Smart Contract

The deployed contract is `AgentDataMarket`.

- `createListing(...)` creates a dataset listing.
- `purchaseData(...)` locks buyer funds.
- `executeAndSwap(...)` is the keeper/owner settlement path.

## License

MIT

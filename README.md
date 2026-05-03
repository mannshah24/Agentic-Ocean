# Agentic Ocean - Private Agent-to-Agent Data Market

Agentic Ocean is a private AI agent data market built for the ETHGlobal Open Agents track. Agents sell encrypted datasets to other agents with a pay-to-decrypt (x402) flow. The system validates data quality with 0G Compute (Sealed TEE inference), stores encrypted payloads on 0G Storage, and delivers decryption keys over Gensyn AXL. KeeperHub and Uniswap handle trusted execution and token swapping.

## Core Flow

1. Seller agent encrypts data and uploads it to 0G Storage.
2. 0G Compute validates encrypted data quality inside a TEE and outputs a score.
3. Buyer agent pays through x402 with KeeperHub enforcing execution.
4. Gensyn AXL delivers the decryption key after payment is verified.
5. Uniswap swaps buyer funds into seller-preferred tokens.

## Sponsor Integrations (Open Agents Side Tracks)

- 0G Storage & Compute: encrypted dataset storage + TEE validation.
- Gensyn AXL: agent-to-agent encrypted delivery for decryption keys.
- x402 + KeeperHub: pay-to-decrypt flow with execution guarantees.
- Uniswap: token swap during payout.
- ENS: vendor identity and reputation records.

## Tech Stack

- Next.js App Router
- React + TypeScript
- RainbowKit + Wagmi
- 0G SDK: @0glabs/0g-ts-sdk
- Solidity contracts (AgentDataMarket)

## App Pages

- /: Live Dashboard + Agent Command Console + Data Listings
- /network-flows: Global market activity view
- /my-agents: Vendor dashboard for datasets and earnings

## API Routes

- POST /api/data-upload
	- Input: { agentEns, encryptedDataPayload, dataMetadata }
	- Uploads to 0G Storage and returns storage hash + TEE score (mocked TEE).

- POST /api/axl-delivery
	- Input: { buyerEns, sellerEns, listingId, transactionHash }
	- Uses Gensyn AXL WebSocket relay to request decryption key delivery.

## Smart Contract

- contracts/AgentDataMarket.sol
	- Data listings with Pay-to-Unlock flow.
	- purchaseData locks funds.
	- KeeperHub triggers executeAndSwap after AXL delivery confirmation.

## Environment Variables

Create a .env.local file with the following values:

```
ZEROG_RPC_URL=
ZEROG_PRIVATE_KEY=
ZEROG_INDEXER_URL=
GENSYN_WSS_URL=
NEXT_PUBLIC_ESCROW_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=
NEXT_PUBLIC_PAYOUT_TOKEN_ADDRESS=
NEXT_PUBLIC_ENABLE_LEGACY_MARKETPLACE=false
```

Notes:
- GENSYN_WSS_URL defaults to wss://relay.gensyn.network/v1/axl if unset.
- NEXT_PUBLIC_ENABLE_LEGACY_MARKETPLACE is off by default after the pivot.

## Local Development

Install dependencies and start the dev server:

```
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

## Demo Tips

- Use the Agent Command Console to deploy the autonomous buyer agent.
- The Live Agent Log shows decisions and steps during x402 flow.
- If AXL delivery times out, ensure a seller agent is listening on the relay.

## Project Structure

- app/: Next.js routes
- components/: UI components and agent console
- contracts/: Solidity contracts
- hooks/: Web3 helpers

## License

MIT

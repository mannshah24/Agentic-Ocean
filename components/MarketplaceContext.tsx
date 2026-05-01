"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { parseEventLogs, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS =
  (process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000";
const PAYOUT_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_PAYOUT_TOKEN_ADDRESS as
    | `0x${string}`
    | undefined) ?? "0x0000000000000000000000000000000000000000";

const ESCROW_ABI = [
  {
    type: "function",
    name: "hireAgent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentWallet", type: "address" },
      { name: "tokenIn", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "collateralRequired", type: "uint256" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
  },
  {
    type: "function",
    name: "stakeCollateral",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "finalizeJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "tokenOut", type: "address" },
      { name: "poolFee", type: "uint24" },
      { name: "success", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "JobCreated",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "employer", type: "address", indexed: true },
      { name: "serviceAgent", type: "address", indexed: true },
      { name: "tokenIn", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "collateralRequired", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
] as const;

type JobStatus =
  | "open"
  | "broadcasting"
  | "signing"
  | "staking"
  | "auditing"
  | "finalizing"
  | "executing"
  | "error";

type MarketplaceJob = {
  id: string;
  title: string;
  client: string;
  bounty: string;
  status: JobStatus;
  collateralPct: number;
  agentEns?: string;
  agentWallet?: `0x${string}`;
  onchainJobId?: bigint;
};

type NegotiationResponse = {
  status: "agreed" | "rejected";
  serviceAgentEns: string;
  agreedPrice: string;
  axlSignature: `0x${string}`;
  agentWallet?: `0x${string}`;
};

const MARKETPLACE_JOBS: MarketplaceJob[] = [
  {
    id: "rust-audit-001",
    title: "Smart Contract Rust Audit",
    client: "defi-protocol.eth",
    bounty: "50 USDC",
    status: "open",
    collateralPct: 20,
  },
  {
    id: "zk-circuit-009",
    title: "ZK-Proof Circuit Design",
    client: "zero-knowledge.eth",
    bounty: "120 USDC",
    status: "open",
    collateralPct: 25,
  },
  {
    id: "sol-mev-122",
    title: "Solana MEV Bot Optimization",
    client: "speed-labs.eth",
    bounty: "80 USDC",
    status: "open",
    collateralPct: 15,
  },
];

type MarketplaceContextValue = {
  jobs: MarketplaceJob[];
  errorMessage: string | null;
  finalizeJob: (job: MarketplaceJob, success: boolean) => void;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const publicClient = usePublicClient();
  const [jobs, setJobs] = useState<MarketplaceJob[]>(MARKETPLACE_JOBS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const openJob = useMemo(
    () => jobs.find((job) => job.status === "open"),
    [jobs]
  );

  useEffect(() => {
    if (!isConnected || activeJobId || !openJob) {
      return;
    }

    const timer = setTimeout(() => {
      handleHire(openJob.id);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isConnected, activeJobId, openJob]);

  const handleHire = async (jobId: string) => {
    if (!isConnected) {
      setErrorMessage("Connect a wallet to enable auto-bidding.");
      return;
    }

    setErrorMessage(null);
    setActiveJobId(jobId);
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: "broadcasting" } : job
      )
    );

    try {
      const job = jobs.find((item) => item.id === jobId);
      if (!job) {
        throw new Error("Job not found");
      }

      const negotiateResponse = await fetch("/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employerRequest: {
            taskId: job.id,
            employerEns: job.client,
            budget: job.bounty,
            summary: job.title,
          },
        }),
      });

      if (!negotiateResponse.ok) {
        throw new Error("Negotiation failed");
      }

      const negotiation =
        (await negotiateResponse.json()) as NegotiationResponse;

      if (negotiation.status !== "agreed") {
        throw new Error("Negotiation rejected");
      }

      setJobs((prev) =>
        prev.map((item) =>
          item.id === jobId
            ? { ...item, status: "signing", agentEns: negotiation.serviceAgentEns }
            : item
        )
      );

      const numericBounty = Number.parseFloat(job.bounty);
      const amount = Number.isFinite(numericBounty)
        ? parseUnits(numericBounty.toString(), 6)
        : parseUnits("0", 6);
      const collateralAmount = Number.isFinite(numericBounty)
        ? parseUnits(
            ((numericBounty * job.collateralPct) / 100).toString(),
            6
          )
        : parseUnits("0", 6);

      let resolvedAgentWallet: `0x${string}` | undefined =
        negotiation.agentWallet;

      if (!resolvedAgentWallet && publicClient) {
        resolvedAgentWallet = (await publicClient.getEnsAddress({
          name: negotiation.serviceAgentEns,
        })) as `0x${string}` | null | undefined;
      }

      const agentWallet =
        resolvedAgentWallet ??
        (process.env.NEXT_PUBLIC_DEFAULT_AGENT_ADDRESS as
          | `0x${string}`
          | undefined) ??
        "0x0000000000000000000000000000000000000000";

      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: ESCROW_ABI,
          functionName: "hireAgent",
          args: [agentWallet, USDC_ADDRESS, amount, collateralAmount],
        },
        {
          onSuccess: async (hash) => {
            setJobs((prev) =>
              prev.map((item) =>
                item.id === jobId ? { ...item, status: "staking" } : item
              )
            );

            if (!publicClient) {
              setErrorMessage("Missing public client for receipt parsing.");
              setActiveJobId(null);
              return;
            }

            const receipt = await publicClient.waitForTransactionReceipt({
              hash,
            });
            const parsed = parseEventLogs({
              abi: ESCROW_ABI,
              logs: receipt.logs,
              eventName: "JobCreated",
            });
            const jobCreated = parsed[0]?.args;
            const onchainJobId = jobCreated?.jobId;

            if (!onchainJobId) {
              setErrorMessage("Unable to read job id from chain.");
              setActiveJobId(null);
              return;
            }

            setJobs((prev) =>
              prev.map((item) =>
                item.id === jobId
                  ? {
                      ...item,
                      onchainJobId,
                      agentWallet,
                    }
                  : item
              )
            );

            writeContract(
              {
                address: CONTRACT_ADDRESS,
                abi: ESCROW_ABI,
                functionName: "stakeCollateral",
                args: [onchainJobId, collateralAmount],
              },
              {
                onSuccess: () => {
                  setJobs((prev) =>
                    prev.map((item) =>
                      item.id === jobId ? { ...item, status: "auditing" } : item
                    )
                  );
                  setActiveJobId(null);
                },
                onError: () => {
                  setJobs((prev) =>
                    prev.map((item) =>
                      item.id === jobId ? { ...item, status: "error" } : item
                    )
                  );
                  setActiveJobId(null);
                },
              }
            );
          },
          onError: () => {
            setJobs((prev) =>
              prev.map((item) =>
                item.id === jobId ? { ...item, status: "error" } : item
              )
            );
            setActiveJobId(null);
          },
        }
      );
    } catch (error) {
      setJobs((prev) =>
        prev.map((item) =>
          item.id === jobId ? { ...item, status: "error" } : item
        )
      );
      setErrorMessage("Unable to broadcast or negotiate.");
      setActiveJobId(null);
    }
  };

  const finalizeJob = (job: MarketplaceJob, success: boolean) => {
    if (!job.onchainJobId) {
      setErrorMessage("Missing on-chain job id.");
      return;
    }

    setJobs((prev) =>
      prev.map((item) =>
        item.id === job.id ? { ...item, status: "finalizing" } : item
      )
    );

    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "finalizeJob",
        args: [job.onchainJobId, PAYOUT_TOKEN_ADDRESS, 3000, success],
      },
      {
        onSuccess: () => {
          setJobs((prev) =>
            prev.map((item) =>
              item.id === job.id ? { ...item, status: "executing" } : item
            )
          );
        },
        onError: () => {
          setJobs((prev) =>
            prev.map((item) =>
              item.id === job.id ? { ...item, status: "error" } : item
            )
          );
        },
      }
    );
  };

  return (
    <MarketplaceContext.Provider value={{ jobs, errorMessage, finalizeJob }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error("useMarketplace must be used inside MarketplaceProvider");
  }
  return ctx;
}

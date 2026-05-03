"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SelectedListing } from "@/components/VendorInspector";

type DataListing = {
  id: string;
  title: string;
  sellerEns: string;
  price: string;
  tokenIn: string;
  ogStorageHash: string;
  teeQualityScore: number;
  summary: string;
};

type ListingStatus = "locked" | "paying" | "awaiting" | "unlocked" | "error";

type ListingState = {
  status: ListingStatus;
  error?: string;
  decryptionKey?: string;
  txPhase?: "idle" | "signing" | "broadcasting" | "awaiting-key";
};

const BUYER_ENS_PLACEHOLDER = "buyer.agenticocean.eth";
const DEMO_MAX_EMPTY_SCANS = 3;
const DEMO_RELAX_AFTER_SCANS = 2;

const DATA_LISTINGS: DataListing[] = [
  {
    id: "alpha-01",
    title: "Q3 DeFi Exploit Alpha",
    sellerEns: "alpha-intel.deaddrop.eth",
    price: "240 USDC",
    tokenIn: "USDC",
    ogStorageHash: "0x8c9a4b13f0e3e7c06a1d7c6f9d6d9e0c4b8b64c0",
    teeQualityScore: 92,
    summary: "High-signal exploit patterns across lending protocols.",
  },
  {
    id: "zk-07",
    title: "ZK-Rollup Vulnerability Scan",
    sellerEns: "nullproof.deaddrop.eth",
    price: "410 USDC",
    tokenIn: "USDC",
    ogStorageHash: "0x2b7f10bb4aaf2f5d138e6f12a4f3bb4cdd9912a4",
    teeQualityScore: 88,
    summary: "Encrypted audit traces across ZK circuits and proof systems.",
  },
  {
    id: "sent-19",
    title: "Consumer Sentiment Datasets",
    sellerEns: "aurora.market.eth",
    price: "160 USDC",
    tokenIn: "USDC",
    ogStorageHash: "0x91a3d8b1b0c58d0bd7a59158a2e1ed9f5c2b3d10",
    teeQualityScore: 79,
    summary: "Retail sentiment drift across L2 ecosystems.",
  },
];

const statusLabel: Record<ListingStatus, string> = {
  locked: "Locked. Awaiting agent command",
  paying: "Confirming wallet transaction...",
  awaiting: "Awaiting Decryption Key via AXL...",
  unlocked: "Data Unlocked",
  error: "AXL delivery failed",
};

const statusTone: Record<ListingStatus, string> = {
  locked: "border-[#1E2A3A] bg-[#0F151B] text-[#7DD3FC]",
  paying: "border-[#2B3A5A] bg-[#0D1C2B] text-[#7DD3FC]",
  awaiting: "border-[#6A1BFF]/40 bg-[#1A0F2B] text-[#B892FF]",
  unlocked: "border-[#39FF88]/50 bg-[#0D2016] text-[#39FF88]",
  error: "border-[#FF4066]/40 bg-[#2A0F17] text-[#FF8EA1]",
};

function buildTxHash(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
}

async function simulateWalletTransaction() {
  return new Promise((resolve) => setTimeout(resolve, 1200));
}

type DataMarketHubProps = {
  onSelectListing: (listing: SelectedListing) => void;
  onOpenInspector?: (open: boolean) => void;
};

export default function DataMarketHub({
  onSelectListing,
  onOpenInspector,
}: DataMarketHubProps) {
  const initialState = useMemo<Record<string, ListingState>>(() => {
    return Object.fromEntries(
      DATA_LISTINGS.map((listing) => [listing.id, { status: "locked" }]),
    );
  }, []);

  const agentLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agentActiveRef = useRef(false);
  const listingStateTimers = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const listingStatesRef = useRef<Record<string, ListingState>>(initialState);
  const emptyScanCountRef = useRef(0);

  const [listingStates, setListingStates] = useState(initialState);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [maxPriceInput, setMaxPriceInput] = useState("500");
  const [minScoreInput, setMinScoreInput] = useState("70");
  const [soldCount, setSoldCount] = useState(0);
  const [agentLogs, setAgentLogs] = useState<string[]>([
    "Agent initialized...",
    "Scanning 0G listings...",
    "Ready with demo-safe thresholds.",
  ]);

  useEffect(() => {
    listingStatesRef.current = listingStates;
  }, [listingStates]);

  useEffect(() => {
    return () => {
      Object.values(listingStateTimers.current).forEach(clearTimeout);
      if (agentLoopRef.current) {
        clearTimeout(agentLoopRef.current);
      }
      agentActiveRef.current = false;
    };
  }, []);

  const updateListingState = (listingId: string, nextState: ListingState) => {
    setListingStates((prev) => ({
      ...prev,
      [listingId]: nextState,
    }));
  };

  const scheduleReset = (listingId: string, delayMs = 3200) => {
    if (listingStateTimers.current[listingId]) {
      clearTimeout(listingStateTimers.current[listingId]);
    }

    listingStateTimers.current[listingId] = setTimeout(() => {
      updateListingState(listingId, { status: "locked" });
    }, delayMs);
  };

  const appendLog = (entry: string) => {
    setAgentLogs((prev) => [...prev.slice(-24), entry]);
  };

  const stopAgent = (reason: string) => {
    if (agentLoopRef.current) {
      clearTimeout(agentLoopRef.current);
      agentLoopRef.current = null;
    }

    agentActiveRef.current = false;
    setIsAgentRunning(false);
    appendLog(reason);
  };

  const handlePurchase = async (listing: DataListing) => {
    const currentStatus = listingStates[listing.id]?.status;
    if (currentStatus === "paying" || currentStatus === "awaiting") {
      return false;
    }
    if (currentStatus === "unlocked") {
      return true;
    }

    updateListingState(listing.id, { status: "paying", txPhase: "signing" });
    appendLog(`Initiating x402 payment for ${listing.title}.`);

    try {
      appendLog("Awaiting wallet signature...");
      await simulateWalletTransaction();

      updateListingState(listing.id, {
        status: "awaiting",
        txPhase: "broadcasting",
      });
      appendLog("Payment confirmed. Requesting AXL delivery...");

      const response = await fetch("/api/axl-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerEns: BUYER_ENS_PLACEHOLDER,
          sellerEns: listing.sellerEns,
          listingId: listing.id,
          transactionHash: buildTxHash(),
        }),
      });

      if (!response.ok) {
        if (response.status === 408) {
          throw new Error("AXL_TIMEOUT");
        }
        throw new Error("AXL_NETWORK_ERROR");
      }

      const data = (await response.json()) as { decryptionKey?: string };

      if (!data.decryptionKey) {
        throw new Error("MISSING_KEY");
      }

      setSoldCount((prev) => prev + 1);
      updateListingState(listing.id, {
        status: "unlocked",
        decryptionKey: data.decryptionKey,
        txPhase: "idle",
      });
      appendLog(`Decryption key received. ${listing.title} unlocked.`);
      onOpenInspector?.(false);
      return true;
    } catch (error) {
      const message =
        error instanceof Error && error.message === "AXL_TIMEOUT"
          ? "AXL delivery timed out. Retry purchase."
          : "AXL delivery failed. Please retry.";

      updateListingState(listing.id, {
        status: "error",
        error: message,
        txPhase: "idle",
      });
      appendLog(message);
      scheduleReset(listing.id);
      return false;
    }
  };

  const handleInspect = (listing: DataListing) => {
    onSelectListing({
      title: listing.title,
      vendorEns: listing.sellerEns,
      price: listing.price,
      teeScore: listing.teeQualityScore,
    });
    onOpenInspector?.(true);
  };

  const selectListingForInspector = (listing: DataListing) => {
    onSelectListing({
      title: listing.title,
      vendorEns: listing.sellerEns,
      price: listing.price,
      teeScore: listing.teeQualityScore,
    });
    onOpenInspector?.(true);
  };

  const parsePrice = (price: string) => {
    const parsed = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
  };

  const deployAgent = async () => {
    if (agentActiveRef.current) {
      return;
    }

    agentActiveRef.current = true;
    setIsAgentRunning(true);
    emptyScanCountRef.current = 0;
    appendLog("Autonomous buyer agent deployed.");

    const runLoop = async () => {
      if (!agentActiveRef.current) {
        return;
      }

      const maxPrice = Number.parseFloat(maxPriceInput);
      const minScore = Number.parseFloat(minScoreInput);
      const budget = Number.isFinite(maxPrice)
        ? maxPrice
        : Number.POSITIVE_INFINITY;
      const scoreFloor = Number.isFinite(minScore) ? minScore : 0;

      const candidate = DATA_LISTINGS.find((listing) => {
        const status = listingStatesRef.current[listing.id]?.status;
        return (
          status === "locked" &&
          parsePrice(listing.price) <= budget &&
          listing.teeQualityScore >= scoreFloor
        );
      });

      const fallbackCandidate =
        candidate ??
        (emptyScanCountRef.current >= DEMO_RELAX_AFTER_SCANS
          ? DATA_LISTINGS.find(
              (listing) => listingStatesRef.current[listing.id]?.status === "locked",
            )
          : undefined);

      if (fallbackCandidate) {
        emptyScanCountRef.current = 0;
        if (!candidate) {
          appendLog(
            `Relaxing demo thresholds. Target acquired: ${fallbackCandidate.title}.`,
          );
        }

        selectListingForInspector(fallbackCandidate);
        appendLog(
          `Target acquired: ${fallbackCandidate.title}. Initiating x402 payment...`,
        );
        const success = await handlePurchase(fallbackCandidate);
        if (success) {
          stopAgent("Purchase complete. Agent shutting down.");
          return;
        }
      } else {
        emptyScanCountRef.current += 1;
        appendLog("No qualifying listings. Rescanning...");

        if (emptyScanCountRef.current >= DEMO_MAX_EMPTY_SCANS) {
          appendLog("Demo scan cap reached. Auto-relaxing filters...");
          return;
        }
      }

      agentLoopRef.current = setTimeout(runLoop, 3000);
    };

    runLoop();
  };

  return (
    <section className="rounded-2xl border border-[#1C1F2A] bg-linear-to-br from-[#0B0F14] via-[#0A0B10] to-[#0B0F14] p-6 shadow-[0_0_60px_rgba(0,242,254,0.08)]">
      <header className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#39FF88] shadow-[0_0_12px_rgba(57,255,136,0.8)]" />
          <h3 className="text-lg font-semibold tracking-wide text-white">
            Private Intelligence Exchange
          </h3>
        </div>
        <p className="text-sm text-[#6B7280]">
          Encrypted data listings validated by 0G Compute, unlocked via x402 +
          Gensyn AXL delivery.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#9CA3AF]">
          <span className="rounded-full border border-[#1F2937] bg-[#0B0F14] px-3 py-1 text-[#7DD3FC]">
            Demo Mode
          </span>
          <span className="rounded-full border border-[#1F2937] bg-[#0B0F14] px-3 py-1 text-[#39FF88]">
            Sold: {soldCount}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-[#6B7280]">
          <span className="rounded-full border border-[#1F2937] bg-[#0E1218] px-3 py-1 text-[#9CA3AF]">
            Pay-to-Decrypt
          </span>
          <span className="rounded-full border border-[#1F2937] bg-[#0E1218] px-3 py-1 text-[#9CA3AF]">
            TEE Verified
          </span>
          <span className="rounded-full border border-[#1F2937] bg-[#0E1218] px-3 py-1 text-[#9CA3AF]">
            0G Storage
          </span>
        </div>
      </header>

      <section className="mb-6 rounded-2xl border border-[#1F232B] bg-[#0E1116] p-5 shadow-[0_0_40px_rgba(57,255,136,0.08)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
              Agent Command Console
            </p>
            <h4 className="mt-2 text-lg font-semibold text-white">
              Deploy an autonomous buyer to scan, verify, and purchase datasets.
            </h4>
          </div>
          <span className="rounded-full border border-[#1F2937] bg-[#0B0F14] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#9CA3AF]">
            Agent Ops
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[#9CA3AF]">
            Max Price (USDC)
            <input
              type="number"
              placeholder="250"
              value={maxPriceInput}
              onChange={(event) => setMaxPriceInput(event.target.value)}
              className="w-full rounded-lg border border-[#1D2330] bg-[#0B0F14] px-3 py-2 text-sm text-white placeholder:text-[#4B5563]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-[#9CA3AF]">
            Minimum TEE Quality Score (1-100)
            <input
              type="number"
              placeholder="85"
              min={1}
              max={100}
              value={minScoreInput}
              onChange={(event) => setMinScoreInput(event.target.value)}
              className="w-full rounded-lg border border-[#1D2330] bg-[#0B0F14] px-3 py-2 text-sm text-white placeholder:text-[#4B5563]"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={deployAgent}
          disabled={isAgentRunning}
          className="mt-5 w-full rounded-xl border border-[#39FF88]/60 bg-[#0D2016] px-6 py-3 text-sm font-semibold text-[#39FF88] shadow-[0_0_35px_rgba(57,255,136,0.35)] transition hover:shadow-[0_0_45px_rgba(57,255,136,0.5)]"
        >
          {isAgentRunning ? "Agent Deployed" : "Deploy Autonomous Buyer Agent"}
        </button>

        <div className="mt-5 max-h-40 overflow-y-auto rounded-xl border border-[#1C1F27] bg-black px-4 py-3 font-mono text-xs text-[#39FF88] scrollbar-hidden">
          {agentLogs.map((entry, index) => (
            <p key={`${entry}-${index}`}>{entry}</p>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {DATA_LISTINGS.map((listing) => {
          const state = listingStates[listing.id] ?? { status: "idle" };

          return (
            <article
              key={listing.id}
              className="rounded-xl border border-[#1D2330] bg-[#0E1218] p-5 shadow-[0_0_24px_rgba(110,231,255,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#39FF88]/40 hover:shadow-[0_0_40px_rgba(57,255,136,0.12)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-semibold text-white">
                    {listing.title}
                  </h4>
                  <p className="mt-1 text-xs text-[#8B93A5]">
                    Vendor: {listing.sellerEns}
                  </p>
                  <p className="mt-3 text-sm text-[#A3AEC2]">
                    {listing.summary}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#39FF88]">
                    TEE Score
                  </span>
                  <span className="text-3xl font-semibold text-[#39FF88]">
                    {listing.teeQualityScore}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#7C8699]">
                <div className="rounded-lg border border-[#1C2634] bg-[#0C1218] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#4B5563]">
                    Price
                  </div>
                  <div className="mt-1 font-mono text-sm text-[#7DD3FC]">
                    {listing.price}
                  </div>
                </div>
                <div className="rounded-lg border border-[#1C2634] bg-[#0C1218] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#4B5563]">
                    Token In
                  </div>
                  <div className="mt-1 font-mono text-sm text-[#7DD3FC]">
                    {listing.tokenIn}
                  </div>
                </div>
                <div className="col-span-2 rounded-lg border border-[#1C2634] bg-[#0C1218] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#4B5563]">
                    0G Storage Hash
                  </div>
                  <div className="mt-1 truncate font-mono text-xs text-[#9CA3AF]">
                    {listing.ogStorageHash}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {state.txPhase && state.txPhase !== "idle" && (
                  <div className="rounded-lg border border-[#1C2634] bg-[#08111A] px-3 py-2 text-xs text-[#7DD3FC]">
                    {state.txPhase === "signing" && "Waiting for wallet signature..."}
                    {state.txPhase === "broadcasting" && "Transaction broadcast. Confirming payment..."}
                    {state.txPhase === "awaiting-key" && "Awaiting decryption key delivery..."}
                  </div>
                )}

                <div
                  className={`rounded-lg border px-3 py-2 text-center text-sm ${
                    statusTone[state.status]
                  }`}
                >
                  {state.status === "unlocked" ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#39FF88] shadow-[0_0_10px_rgba(57,255,136,0.7)]" />
                      {statusLabel[state.status]}
                    </div>
                  ) : (
                    statusLabel[state.status]
                  )}
                </div>

                {state.status === "error" && (
                  <div className="text-xs text-[#FF8EA1]">{state.error}</div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {state.status !== "unlocked" ? (
                    <button
                      type="button"
                      onClick={() => handlePurchase(listing)}
                      className="flex-1 rounded-lg border border-[#1C3B52] bg-[#081826] px-4 py-2 text-sm font-semibold text-[#7DD3FC] transition hover:border-[#39FF88] hover:text-[#39FF88]"
                    >
                      {state.status === "paying"
                        ? "Signing Purchase..."
                        : state.status === "awaiting"
                          ? "Confirming Purchase..."
                          : "Purchase Data via x402"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-[#39FF88]/50 bg-[#0D2016] px-4 py-2 text-sm font-semibold text-[#39FF88]"
                    >
                      View Encrypted Payload
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleInspect(listing)}
                    className="rounded-lg border border-[#2A2A2E] bg-[#0B0F14] px-3 py-2 text-[11px] font-semibold text-[#9CA3AF] transition hover:border-[#952AFF] hover:text-white"
                  >
                    Inspect
                  </button>

                  <div className="rounded-lg border border-[#1C2634] bg-[#0C1218] px-3 py-2 text-[11px] text-[#6B7280]">
                    AXL Delivery
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

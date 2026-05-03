"use client";

import { useMemo, useState } from "react";
import { useEnsAvatar } from "wagmi";

export type SelectedListing = {
  title: string;
  vendorEns: string;
  price: string;
  teeScore: number;
} | null;

type VendorInspectorProps = {
  selectedListing: SelectedListing;
};

const MOCK_TX_HASH = "0x8f7c9ab1d2e3f4a5";

function truncateHash(hash: string) {
  if (hash.length <= 12) {
    return hash;
  }
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export default function VendorInspector({
  selectedListing,
}: VendorInspectorProps) {
  const [copied, setCopied] = useState(false);

  const ensName = selectedListing?.vendorEns;
  const { data: ensAvatar, status: avatarStatus } = useEnsAvatar({
    name: ensName ?? undefined,
  });

  const isLoading = avatarStatus === "pending";
  const displayEns = useMemo(
    () => ensName ?? "Unknown vendor",
    [ensName],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_TX_HASH);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  if (!selectedListing) {
    return (
      <section className="rounded-2xl border border-[#2A2A2E] bg-[#141416] p-6 text-white">
        <div className="mb-4 text-xs uppercase tracking-[0.28em] text-[#6B7280]">
          Vendor & Dataset Inspector
        </div>
        <div className="rounded-xl border border-[#2A2A2E] bg-[#0F1116] px-4 py-6 text-center text-sm text-[#9CA3AF]">
          Select a dataset to inspect cryptographic proofs.
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#2A2A2E] bg-[#141416] p-6 text-white">
      <div className="pointer-events-none absolute -top-24 right-0 h-40 w-40 rounded-full bg-[#39FF88] opacity-10 blur-3xl" />
      <div className="mb-4 text-xs uppercase tracking-[0.28em] text-[#6B7280]">
        Data Cryptographic Proof
      </div>

      <div className="mb-5 rounded-xl border border-[#2A2A2E] bg-[#0F1116] p-4">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-12 w-12 rounded-full bg-[#1C1F27] animate-pulse" />
          ) : ensAvatar ? (
            <img
              src={ensAvatar}
              alt={displayEns}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00F2FE] to-[#39FF88] text-sm font-semibold">
              {displayEns.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
              Vendor ENS
            </div>
            {isLoading ? (
              <div className="mt-2 h-4 w-36 rounded bg-[#1C1F27] animate-pulse" />
            ) : (
              <div className="text-sm font-semibold text-white">
                {displayEns}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[#1C2634] bg-[#0B0F14] px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280]">
            Dataset
          </div>
          <div className="mt-1 text-sm text-white">{selectedListing.title}</div>
          <div className="mt-1 text-xs text-[#9CA3AF]">
            Listed at {selectedListing.price}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-[#2A2A2E] bg-[#0F1116] p-4">
          <div className="text-xs uppercase tracking-[0.28em] text-[#6B7280]">
            0G Storage Location
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-[#1C2634] bg-[#0B0F14] px-3 py-2">
            <span className="font-mono text-xs text-[#9CA3AF]">
              {truncateHash(MOCK_TX_HASH)}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-[#1C3B52] bg-[#081826] px-3 py-1 text-[11px] font-semibold text-[#7DD3FC] transition hover:border-[#39FF88] hover:text-[#39FF88]"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#2A2A2E] bg-[#0F1116] p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.28em] text-[#6B7280]">
              0G Compute Validation
            </div>
            <span className="rounded-full border border-[#39FF88]/50 bg-[#0D2016] px-2 py-1 text-[10px] font-semibold text-[#39FF88]">
              TEE Enclave Verified
            </span>
          </div>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-semibold text-[#39FF88]">
              {selectedListing.teeScore}
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
              Score
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
"use client";
import { useMarketplace } from "./MarketplaceContext";

export default function TaskFlowHub() {
  const { jobs, errorMessage } = useMarketplace();
    );
  };

  return (
    <div className="bg-[#0A0A0B] border border-[#2A2A2E] rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse"></span>
          Marketplace Jobs
        </h3>
        <span className="text-xs text-zinc-500">{jobs.length} open roles</span>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
          {errorMessage}
        </div>
      )}

      <div className="max-h-[360px] space-y-4 overflow-y-auto pr-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-lg border border-[#2A2A2E] bg-[#141416] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-semibold text-white">
                  {job.title}
                </h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Client: {job.client}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-[#00F2FE]">
                  {job.bounty}
                </div>
                <div className="text-xs text-zinc-500">
                  Status: {job.status}
                </div>
                <div className="text-xs text-purple-300">
                  Collateral: {job.collateralPct}%
                </div>
              </div>
            </div>

            <div className="mt-4">
              {job.status === "open" && (
                <div className="w-full rounded-md border border-[#00F2FE]/30 bg-[#00F2FE]/10 py-2 text-center text-sm text-[#00F2FE]">
                  Auto-bidding on agent mesh...
                </div>
              )}
              {job.status === "broadcasting" && (
                <div className="w-full rounded-md border border-[#952AFF]/30 bg-[#952AFF]/10 py-2 text-center text-sm text-[#952AFF] animate-pulse">
                  Broadcasting to Gensyn AXL...
                </div>
              )}
              {job.status === "signing" && (
                <div className="w-full rounded-md border border-[#00F2FE]/30 bg-[#00F2FE]/10 py-2 text-center text-sm text-[#00F2FE]">
                  Awaiting wallet signature...
                </div>
              )}
              {job.status === "staking" && (
                <div className="w-full rounded-md border border-[#00F2FE]/30 bg-[#00F2FE]/10 py-2 text-center text-sm text-[#00F2FE]">
                  Locking agent collateral...
                </div>
              )}
              {job.status === "auditing" && (
                <div className="w-full rounded-md border border-purple-400/30 bg-purple-400/10 py-2 text-center text-sm text-purple-300">
                  Awaiting auditor verdict...
                </div>
              )}
              {job.status === "executing" && (
                <div className="w-full rounded-md border border-green-400/30 bg-green-400/10 py-2 text-center text-sm text-green-400">
                  Executing safely via KeeperHub
                </div>
              )}
              {job.status === "error" && (
                <div className="w-full rounded-md border border-rose-500/30 bg-rose-500/10 py-2 text-center text-sm text-rose-300">
                  Negotiation failed. Try again.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

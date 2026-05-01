"use client";

import { useMarketplace } from "./MarketplaceContext";

export default function AuditorPanel() {
  const { jobs, finalizeJob } = useMarketplace();
  const auditable = jobs.filter((job) => job.status === "auditing");

  return (
    <section className="rounded-2xl border border-[#232327] bg-[#0F0F11] p-4 text-zinc-100">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Auditor Panel
        </p>
        <span className="text-xs text-zinc-500">{auditable.length} queued</span>
      </div>

      {auditable.length === 0 ? (
        <div className="rounded-lg border border-[#2A2A2E] bg-[#141416] px-3 py-2 text-xs text-zinc-400">
          No audits pending.
        </div>
      ) : (
        <div className="space-y-3">
          {auditable.map((job) => (
            <div
              key={job.id}
              className="rounded-lg border border-[#2A2A2E] bg-[#141416] p-3"
            >
              <div className="text-sm font-semibold text-white">
                {job.title}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Client: {job.client}
              </div>
              {job.agentEns && (
                <div className="mt-1 text-xs text-cyan-300">
                  Agent: {job.agentEns}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => finalizeJob(job, true)}
                  className="flex-1 rounded-md border border-green-400/40 bg-green-400/10 py-2 text-xs font-semibold text-green-300"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => finalizeJob(job, false)}
                  className="flex-1 rounded-md border border-rose-500/40 bg-rose-500/10 py-2 text-xs font-semibold text-rose-300"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

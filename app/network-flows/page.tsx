import AgentNetworkVisualizer from "@/components/AgentNetworkVisualizer";

type DeliveryRow = {
  id: string;
  buyerEns: string;
  vendorEns: string;
  storageHash: string;
  status: "Decrypted" | "Awaiting TEE Validation" | "In Transit";
};

const DELIVERY_ROWS: DeliveryRow[] = [
  {
    id: "0x9b2c2d3d8f1a4b1e",
    buyerEns: "atlas.relay.eth",
    vendorEns: "alpha-intel.deaddrop.eth",
    storageHash: "0x8c9a4b13f0e3e7c06a1d7c6f9d6d9e0c4b8b64c0",
    status: "Decrypted",
  },
  {
    id: "0x2c1a0e9b7f4a991c",
    buyerEns: "horizon.metrics.eth",
    vendorEns: "nullproof.deaddrop.eth",
    storageHash: "0x2b7f10bb4aaf2f5d138e6f12a4f3bb4cdd9912a4",
    status: "Awaiting TEE Validation",
  },
  {
    id: "0x7f4b9d2c1a0e9b7f",
    buyerEns: "aurora.market.eth",
    vendorEns: "sentinel-ops.eth",
    storageHash: "0x91a3d8b1b0c58d0bd7a59158a2e1ed9f5c2b3d10",
    status: "In Transit",
  },
  {
    id: "0xd1aa31fbc2a94b0f",
    buyerEns: "quanta.saas.eth",
    vendorEns: "deepmesh.deaddrop.eth",
    storageHash: "0x0f7d1ac42d31aa8f2c95c2f5a1e3d7b6c8e4a923",
    status: "Decrypted",
  },
];

function truncateHash(hash: string) {
  if (hash.length <= 14) {
    return hash;
  }
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function statusTone(status: DeliveryRow["status"]) {
  if (status === "Decrypted") {
    return "text-[#39FF88]";
  }
  if (status === "Awaiting TEE Validation") {
    return "text-[#FBBF24]";
  }
  return "text-[#7DD3FC]";
}

export default function NetworkFlowsPage() {
  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-[#1F232B] bg-[#0E1116]/90 p-6 shadow-[0_0_50px_rgba(0,242,254,0.08)]">
          <p className="text-xs uppercase tracking-[0.4em] text-[#6B7280]">
            Live Ocean Network
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Live Ocean Network
          </h1>
          <p className="mt-2 text-sm text-[#9CA3AF] md:text-base">
            Gensyn AXL & 0G Storage Activity
          </p>
        </header>

        <div className="h-[420px] overflow-hidden rounded-2xl border border-[#1F232B] bg-[#0E1116] shadow-[0_0_45px_rgba(0,242,254,0.08)]">
          <AgentNetworkVisualizer />
        </div>

        <section className="rounded-2xl border border-[#1F232B] bg-[#0E1116] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent x402 Deliveries</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
              Live Sync
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2E] text-xs uppercase tracking-[0.2em] text-[#6B7280]">
                  <th className="py-3 pr-4">Transaction ID</th>
                  <th className="py-3 pr-4">Buyer ENS</th>
                  <th className="py-3 pr-4">Vendor ENS</th>
                  <th className="py-3 pr-4">0G Storage Hash</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {DELIVERY_ROWS.map((row) => (
                  <tr key={row.id} className="text-[#D1D5DB]">
                    <td className="py-3 pr-4 font-mono text-xs text-[#9CA3AF]">
                      {row.id}
                    </td>
                    <td className="py-3 pr-4">{row.buyerEns}</td>
                    <td className="py-3 pr-4">{row.vendorEns}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-[#9CA3AF]">
                      {truncateHash(row.storageHash)}
                    </td>
                    <td
                      className={`py-3 font-semibold ${statusTone(row.status)}`}
                    >
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

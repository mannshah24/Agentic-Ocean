import AgentNetworkVisualizer from "../components/AgentNetworkVisualizer";

const AGENTS = [
  { id: "atlas", position: [-2.6, 0.4, -1.2], meritScore: 92 },
  { id: "aurora", position: [1.4, 1.6, -0.8], meritScore: 76 },
  { id: "sol", position: [2.8, -0.4, 1.8], meritScore: 64 },
  { id: "nexus", position: [-1.6, -1.3, 2.4], meritScore: 83 },
  { id: "drift", position: [0.2, -0.8, -2.6], meritScore: 55 },
];

const LINKS = [
  { from: "atlas", to: "aurora" },
  { from: "aurora", to: "sol" },
  { from: "sol", to: "nexus" },
  { from: "nexus", to: "atlas" },
  { from: "drift", to: "atlas" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[72px,1fr] xl:grid-cols-[72px,1fr,320px]">
        <aside className="flex h-16 items-center justify-between border-b border-[#1A1A1C] bg-[#0A0A0B] px-4 lg:h-auto lg:flex-col lg:justify-start lg:gap-6 lg:border-b-0 lg:border-r lg:border-[#1A1A1C] lg:px-0 lg:py-6">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-zinc-500 lg:flex-col">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.8)]" />
            <span className="hidden lg:block">Ocean</span>
          </div>
          <nav className="flex items-center gap-4 lg:flex-col lg:items-center">
            <button
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[#202024] bg-[#141416] text-zinc-300 transition hover:border-cyan-500/60 hover:text-cyan-300"
              aria-label="Dashboard"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="6" height="6" rx="1.2" />
                <rect x="11" y="3" width="6" height="6" rx="1.2" />
                <rect x="3" y="11" width="6" height="6" rx="1.2" />
                <rect x="11" y="11" width="6" height="6" rx="1.2" />
              </svg>
            </button>
            <button
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[#202024] bg-[#141416] text-zinc-300 transition hover:border-cyan-500/60 hover:text-cyan-300"
              aria-label="Flows"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 6h8a3 3 0 0 1 0 6H6" />
                <path d="M4 6l2-2M4 6l2 2" />
              </svg>
            </button>
            <button
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[#202024] bg-[#141416] text-zinc-300 transition hover:border-cyan-500/60 hover:text-cyan-300"
              aria-label="Agents"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="6" cy="10" r="2.5" />
                <circle cx="14" cy="6" r="2" />
                <circle cx="14" cy="14" r="2" />
                <path d="M8.2 9.1l3.4-1.7M8.2 10.9l3.4 1.7" />
              </svg>
            </button>
          </nav>
          <div className="hidden h-px w-8 bg-[#232327] lg:block" />
        </aside>

        <main className="relative flex min-h-[60vh] flex-col border-x border-[#1A1A1C] bg-[#0A0A0B] px-6 py-6 lg:min-h-screen lg:px-10">
          <header className="flex flex-col gap-4 border-b border-[#1A1A1C] pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  Agentic Ocean
                </p>
                <h1 className="text-2xl font-semibold text-zinc-50">
                  Marketplace Overview
                </h1>
              </div>
              <button className="rounded-full border border-cyan-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200 hover:border-cyan-400">
                Launch Flow
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
              <span className="rounded-full border border-[#232327] px-3 py-1">
                42 agents online
              </span>
              <span className="rounded-full border border-[#232327] px-3 py-1">
                9 flows active
              </span>
              <span className="rounded-full border border-[#232327] px-3 py-1">
                0G merit logs synced
              </span>
            </div>
          </header>

          <section className="mt-6 flex flex-1 flex-col rounded-2xl border border-[#141416] bg-[#0A0A0B] p-6 shadow-[0_0_40px_rgba(0,242,254,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  3D Network Canvas
                </p>
                <h2 className="text-lg font-semibold text-zinc-200">
                  Ocean Visualization Surface
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(149,42,255,0.8)]" />
                Merit pulses
              </div>
            </div>
            <div className="relative mt-6 flex flex-1 overflow-hidden rounded-xl border border-[#202024] bg-black">
              <AgentNetworkVisualizer agents={AGENTS} links={LINKS} />
            </div>
          </section>

          <details className="mt-6 rounded-2xl border border-[#2A2A2E] bg-[#111113] p-5 text-sm text-zinc-300 xl:hidden">
            <summary className="cursor-pointer text-xs uppercase tracking-[0.3em] text-zinc-500">
              Context Panel
            </summary>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-[#202024] bg-[#0E0E10] p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                  Active Agent
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-100">
                  auditor.agenticocean.eth
                </p>
              </div>
              <div className="rounded-xl border border-[#202024] bg-[#0E0E10] p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                  Settlement Status
                </p>
                <p className="mt-2 text-sm text-cyan-300">Awaiting KeeperHub</p>
              </div>
            </div>
          </details>
        </main>

        <aside className="hidden flex-col border-l border-[#2A2A2E] bg-[#0E0E10] px-6 py-6 xl:flex">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">
              Context Panel
            </p>
            <button className="rounded-full border border-[#2A2A2E] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-zinc-400">
              Collapse
            </button>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-[#202024] bg-[#111113] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                Active Agent
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-100">
                auditor.agenticocean.eth
              </p>
              <p className="mt-1 text-xs text-zinc-500">Merit score 92.4</p>
            </div>
            <div className="rounded-xl border border-[#202024] bg-[#111113] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                Negotiation
              </p>
              <p className="mt-2 text-sm text-zinc-200">Flow: Security audit</p>
              <p className="mt-1 text-xs text-zinc-500">Gensyn AXL channel open</p>
            </div>
            <div className="rounded-xl border border-[#202024] bg-[#111113] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                Settlement Status
              </p>
              <p className="mt-2 text-sm text-cyan-300">Awaiting KeeperHub</p>
              <p className="mt-1 text-xs text-zinc-500">Uniswap route: USDC -> WETH</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

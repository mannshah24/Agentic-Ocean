"use client";

import AgentNetworkVisualizer from "@/components/AgentNetworkVisualizer";
import AuditorPanel from "@/components/AuditorPanel";
import { MarketplaceProvider } from "@/components/MarketplaceContext";
import MeritPassport from "@/components/MeritPassport";
import TaskFlowHub from "@/components/TaskFlowHub";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function Home() {
  const { address } = useAccount();

  return (
    <MarketplaceProvider>
      <main className="flex h-screen w-screen bg-[#0A0A0B] text-white font-sans overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-20 md:w-64 border-r border-[#2A2A2E] bg-[#0A0A0B] flex flex-col p-6">
          <h1 className="hidden md:block text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-[#00F2FE] to-[#4FACFE] mb-8">
            AgenticOcean.
          </h1>
          <nav className="flex flex-col space-y-4 text-sm text-gray-400">
            <div className="text-white font-medium hover:text-[#00F2FE] cursor-pointer transition">
              ✦ Dashboard
            </div>
            <div className="hover:text-white cursor-pointer transition">
              Network Flows
            </div>
            <div className="hover:text-white cursor-pointer transition">
              My Agents
            </div>
          </nav>
        </aside>

        {/* MIDDLE CANVAS */}
        <section className="flex-1 p-6 flex flex-col overflow-y-auto">
          <header className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Live Dashboard</h2>
            <ConnectButton />
          </header>

          {/* 3D Visualizer - 50% height */}
          <div className="h-[400px] rounded-xl shadow-2xl shadow-[#00F2FE]/5 shrink-0 mb-6 border border-[#2A2A2E]">
            <AgentNetworkVisualizer />
          </div>

          {/* Task Flow Hub (Gensyn, Uniswap, KeeperHub demo area) */}
          <div className="flex-1">
            <TaskFlowHub />
          </div>
        </section>

        {/* RIGHT CONTEXT PANEL */}
        <aside className="w-80 border-l border-[#2A2A2E] bg-[#141416] p-6 overflow-y-auto">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-6 font-semibold">
            Agent Inspector
          </h3>
          <div className="space-y-4">
            <AuditorPanel />
            {/* Merit Passport (ENS, 0G Storage demo area) */}
            <MeritPassport
              address={address ?? "0x0000000000000000000000000000000000000000"}
            />
          </div>
        </aside>
      </main>
    </MarketplaceProvider>
  );
}

"use client";

import AgentNetworkVisualizer from "@/components/AgentNetworkVisualizer";
import { MarketplaceProvider } from "@/components/MarketplaceContext";
import DataMarketHub from "@/components/DataMarketHub";
import VendorInspector from "@/components/VendorInspector";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SelectedListing } from "@/components/VendorInspector";

export default function Home() {
  const pathname = usePathname();
  const [selectedListing, setSelectedListing] = useState<SelectedListing>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "Network Flows", href: "/network-flows" },
    { name: "My Agents", href: "/my-agents" },
  ];

  return (
    <MarketplaceProvider>
      <main className="relative flex h-screen w-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,242,254,0.08),_transparent_45%)]" />
        {/* LEFT SIDEBAR */}
        <aside className="relative z-10 w-20 md:w-64 border-r border-[#1F232B] bg-[#0B0E13]/90 backdrop-blur-xl flex flex-col p-6">
          <h1 className="hidden md:block text-2xl font-semibold tracking-[-0.04em] text-transparent bg-clip-text bg-linear-to-r from-[#00F2FE] to-[#39FF88] mb-8">
            AgenticOcean.
          </h1>
          <div className="mb-6 hidden md:block rounded-xl border border-[#1F2937] bg-[#0E1218] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#6B7280]">
              Market Status
            </p>
            <p className="mt-2 text-sm font-semibold text-[#39FF88]">
              Live. Verified. Encrypted.
            </p>
          </div>
          <nav className="flex flex-col space-y-4 text-sm">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 transition-all duration-200 ${
                    isActive
                      ? "text-white font-semibold bg-[#121820]"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#0F1319]"
                  }`}
                >
                  <span
                    className={`text-white transition-opacity duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    ✦
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* MIDDLE CANVAS */}
        <section className="relative z-10 flex-1 p-6 flex flex-col overflow-y-auto scrollbar-hidden">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#6B7280]">
                Live Ocean Network
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Live Dashboard
              </h2>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                Real-time encrypted data trades, validated by 0G Compute.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-full border border-[#1F2937] bg-[#0E1218] px-3 py-1 text-xs text-[#9CA3AF]">
                <span className="h-2 w-2 rounded-full bg-[#39FF88]" />
                x402 live
              </div>
              <button
                type="button"
                onClick={() => setIsInspectorOpen((prev) => !prev)}
                className="rounded-full border border-[#1F2937] bg-[#0E1218] px-3 py-1 text-xs font-semibold text-[#9CA3AF] transition hover:border-[#39FF88] hover:text-white"
              >
                {isInspectorOpen ? "Hide Inspector" : "Show Inspector"}
              </button>
              <ConnectButton />
            </div>
          </header>

          {/* 3D Visualizer - 50% height */}
          <div className="h-[420px] rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.08)] shrink-0 mb-6 border border-[#1F232B] bg-[#0E1116]">
            <AgentNetworkVisualizer />
          </div>

          {/* Data Market Hub (AXL delivery, x402, KeeperHub demo area) */}
          <div className="flex-1">
            <DataMarketHub
              onSelectListing={setSelectedListing}
              onOpenInspector={setIsInspectorOpen}
            />
          </div>
        </section>

        {/* RIGHT CONTEXT PANEL */}
        <aside
          className={`absolute right-0 top-0 z-20 h-full w-80 border-l border-[#1F232B] bg-[#111318]/95 p-6 backdrop-blur-xl transition-transform duration-300 ${
            isInspectorOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
              Inspector
            </span>
            <button
              type="button"
              onClick={() => setIsInspectorOpen(false)}
              className="rounded-full border border-[#1F2937] bg-[#0E1218] px-2 py-1 text-[11px] text-[#9CA3AF] transition hover:border-[#39FF88] hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="mt-4 space-y-4 overflow-y-auto scrollbar-hidden">
            <VendorInspector selectedListing={selectedListing} />
          </div>
        </aside>
      </main>
    </MarketplaceProvider>
  );
}

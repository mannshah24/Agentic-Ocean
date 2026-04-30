"use client";

import { useEffect, useMemo, useState } from "react";

type FlowStep = "Posted" | "Bidding" | "Executing" | "Settled";

type TaskFlow = {
  id: string;
  title: string;
  budget: string;
  activeStep: FlowStep;
};

type TaskFlowHubProps = {
  flows?: TaskFlow[];
};

const STEPS: FlowStep[] = ["Posted", "Bidding", "Executing", "Settled"];

export default function TaskFlowHub({ flows = [] }: TaskFlowHubProps) {
  const [taskFlows, setTaskFlows] = useState<TaskFlow[]>(flows);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function fetchTasks() {
      setIsLoading(true);
      setLoadError(null);

      try {
        // Next.js API route should return { tasks: TaskFlow[] }.
        const response = await fetch("/api/tasks", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }

        const payload = (await response.json()) as { tasks?: TaskFlow[] };
        if (isActive && payload.tasks) {
          setTaskFlows(payload.tasks);
        }
      } catch (error) {
        if (isActive) {
          setLoadError("Unable to fetch active tasks.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      isActive = false;
    };
  }, []);

  const flowCount = useMemo(() => taskFlows.length, [taskFlows.length]);

  async function handleHireAgent(flow: TaskFlow) {
    setActiveTaskId(flow.id);
    setActionError(null);
    setLastAction(null);

    try {
      const response = await fetch("/api/communicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: flow.id,
          title: flow.title,
          summary: "Requesting agent negotiation.",
          budget: flow.budget,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to broadcast");
      }

      setLastAction("Negotiation broadcasted");
    } catch (error) {
      setActionError("Unable to trigger negotiation.");
    } finally {
      setActiveTaskId(null);
    }
  }
  return (
    <section className="rounded-2xl border border-[#232327] bg-[#0F0F11] p-5 text-zinc-100">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
            Task Flow Hub
          </p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-100">
            Live Opportunities
          </h3>
        </div>
        <span className="rounded-full border border-[#2A2A2E] px-3 py-1 text-xs uppercase tracking-[0.24em] text-zinc-400">
          {flowCount} flows
        </span>
      </header>

      <div className="mt-5 space-y-4">
        {isLoading && (
          <div className="rounded-2xl border border-[#202024] bg-[#141416] p-4 text-sm text-zinc-400">
            Loading active flows...
          </div>
        )}
        {loadError && (
          <div className="rounded-2xl border border-rose-500/40 bg-[#141416] p-4 text-sm text-rose-300">
            {loadError}
          </div>
        )}
        {!isLoading && !loadError && taskFlows.length === 0 && (
          <div className="rounded-2xl border border-[#202024] bg-[#141416] p-4 text-sm text-zinc-400">
            No active flows yet.
          </div>
        )}
        {taskFlows.map((flow) => (
          <article
            key={flow.id}
            className="rounded-2xl border border-[#202024] bg-[#141416] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  {flow.budget}
                </p>
                <h4 className="mt-2 text-base font-semibold text-zinc-100">
                  {flow.title}
                </h4>
              </div>
              <span className="text-xs text-zinc-500">Active</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {STEPS.map((step, index) => {
                const isActive = flow.activeStep === step;
                const isComplete =
                  STEPS.indexOf(flow.activeStep) > index && !isActive;

                return (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={
                        "flex h-6 w-6 items-center justify-center rounded-full border " +
                        (isActive
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                          : isComplete
                            ? "border-[#2A2A2E] bg-[#1A1A1C] text-zinc-400"
                            : "border-[#2A2A2E] bg-transparent text-zinc-500")
                      }
                    >
                      <span
                        className={
                          "h-2 w-2 rounded-full " +
                          (isActive
                            ? "animate-pulse bg-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.9)]"
                            : isComplete
                              ? "bg-zinc-500"
                              : "bg-zinc-700")
                        }
                      />
                    </div>
                    <span className="text-xs text-zinc-400">{step}</span>
                    {index < STEPS.length - 1 && (
                      <span className="h-px w-6 bg-[#2A2A2E]" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleHireAgent(flow)}
                disabled={activeTaskId === flow.id}
                className={
                  "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em] transition " +
                  (activeTaskId === flow.id
                    ? "cursor-not-allowed border-[#2A2A2E] text-zinc-500"
                    : "border-cyan-500/40 text-cyan-200 hover:border-cyan-400")
                }
              >
                {activeTaskId === flow.id ? "Hiring..." : "Hire Agent"}
              </button>
              <div className="text-xs text-zinc-500">
                {actionError && (
                  <span className="text-rose-300">{actionError}</span>
                )}
                {!actionError && lastAction && (
                  <span className="text-cyan-300">{lastAction}</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

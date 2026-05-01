"use client";

import { useEffect, useState } from "react";
import { useEnsAvatar, useEnsName, useEnsText } from "wagmi";

type MeritTask = {
  taskName: string;
  clientEns: string;
  storageHash: string;
  reputationScore: string;
};

type MeritPassportProps = {
  address: `0x${string}`;
};

export default function MeritPassport({ address }: MeritPassportProps) {
  const { data: ensName, status: ensStatus } = useEnsName({ address });
  const { data: ensAvatar, status: avatarStatus } = useEnsAvatar({
    name: ensName ?? undefined,
  });
  const { data: meritHash, status: meritStatus } = useEnsText({
    name: ensName ?? undefined,
    key: "0g-merit-hash",
  });

  const [tasks, setTasks] = useState<MeritTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const isLoading =
    ensStatus === "pending" ||
    avatarStatus === "pending" ||
    meritStatus === "pending";

  useEffect(() => {
    if (!ensName) {
      return;
    }

    let isActive = true;
    const loadTasks = async () => {
      setTasksLoading(true);
      setTasksError(null);

      try {
        const response = await fetch(
          `/api/merit/${encodeURIComponent(ensName)}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load merit logs");
        }

        const payload = (await response.json()) as { tasks?: MeritTask[] };
        if (isActive) {
          setTasks(payload.tasks ?? []);
        }
      } catch (error) {
        if (isActive) {
          setTasksError("Unable to load merit logs.");
          setTasks([]);
        }
      } finally {
        if (isActive) {
          setTasksLoading(false);
        }
      }
    };

    loadTasks();
    return () => {
      isActive = false;
    };
  }, [ensName]);

  return (
    <div className="flex flex-col gap-4">
      {/* Profile Header */}
      <div className="bg-[#0A0A0B] border border-[#2A2A2E] rounded-xl p-5 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#952AFF] opacity-20 blur-3xl rounded-full"></div>

        <div className="relative z-10">
          {isLoading ? (
            <div className="w-12 h-12 rounded-full bg-[#141416] mb-3 animate-pulse" />
          ) : ensAvatar ? (
            <img
              src={ensAvatar}
              alt={ensName ?? "ENS Avatar"}
              className="w-12 h-12 rounded-full mb-3"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F2FE] to-[#952AFF] mb-3 flex items-center justify-center font-bold">
              {ensName ? ensName.slice(0, 2).toUpperCase() : "AO"}
            </div>
          )}

          {isLoading ? (
            <div className="h-5 w-40 rounded bg-[#141416] animate-pulse" />
          ) : (
            <h2 className="text-lg font-bold text-white tracking-tight">
              {ensName ?? "No ENS Found"}
            </h2>
          )}
          <p className="text-xs text-[#00F2FE] font-mono mt-1">
            ENS Identity Verified
          </p>
        </div>
      </div>

      {/* Trust Score */}
      <div className="bg-[#0A0A0B] border border-[#2A2A2E] rounded-xl p-5">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          0G Storage Trust Score
        </div>
        {isLoading ? (
          <div className="h-8 w-24 rounded bg-[#141416] animate-pulse" />
        ) : (
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            98<span className="text-sm text-gray-500">/100</span>
          </div>
        )}
      </div>

      {/* Immutable Proof of Work Log */}
      <div className="bg-[#0A0A0B] border border-[#2A2A2E] rounded-xl p-5">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
          On-Chain Merit Logs
        </h3>
        {isLoading || tasksLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-[#141416] animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-[#141416] animate-pulse" />
          </div>
        ) : tasksError ? (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {tasksError}
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-md border border-[#2A2A2E] bg-[#141416] px-3 py-2 text-xs text-zinc-400">
            No merit logs found for this agent.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={`${task.storageHash}-${index}`}
                className="border-l-2 border-[#00F2FE] pl-3"
              >
                <div className="text-sm font-medium text-white">
                  {task.taskName}
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {task.clientEns} • {task.reputationScore}
                </div>
                <div className="text-xs font-mono text-gray-500 mt-1 truncate">
                  0G Hash: {task.storageHash}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

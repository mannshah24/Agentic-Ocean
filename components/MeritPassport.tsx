type MeritLog = {
  id: string;
  title: string;
  timestamp: string;
};

type MeritPassportProps = {
  ensSubname: string;
  trustScore: number;
  meritLogs: MeritLog[];
};

export default function MeritPassport({
  ensSubname,
  trustScore,
  meritLogs,
}: MeritPassportProps) {
  return (
    <section className="rounded-2xl border border-[#232327] bg-[#111113] p-5 text-zinc-100">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
            ENS Subname
          </p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-100">
            {ensSubname}
          </h3>
        </div>
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(0,242,254,0.95),rgba(149,42,255,0.35)_55%,rgba(10,10,11,0.2)_75%)] opacity-90" />
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-[#2A2A2E] bg-[#0A0A0B] text-base font-semibold text-cyan-200">
            {trustScore}
          </div>
        </div>
      </header>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Merit Logs
        </p>
        <ul className="mt-3 space-y-3">
          {meritLogs.map((log) => (
            <li
              key={log.id}
              className="flex items-center justify-between rounded-xl border border-[#202024] bg-[#0E0E10] px-3 py-2"
            >
              <div>
                <p className="text-sm text-zinc-200">{log.title}</p>
                <p className="text-xs text-zinc-500">{log.timestamp}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                Proof
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

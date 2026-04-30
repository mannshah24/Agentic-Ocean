type FlowStep = "Posted" | "Bidding" | "Executing" | "Settled";

type TaskFlow = {
  id: string;
  title: string;
  budget: string;
  activeStep: FlowStep;
};

type TaskFlowHubProps = {
  flows: TaskFlow[];
};

const STEPS: FlowStep[] = ["Posted", "Bidding", "Executing", "Settled"];

export default function TaskFlowHub({ flows }: TaskFlowHubProps) {
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
          {flows.length} flows
        </span>
      </header>

      <div className="mt-5 space-y-4">
        {flows.map((flow) => (
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
          </article>
        ))}
      </div>
    </section>
  );
}

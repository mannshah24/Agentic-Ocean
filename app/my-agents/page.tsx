type Listing = {
  id: string;
  title: string;
  price: string;
  purchases: number;
  teeScore: number;
};

const VENDOR_ENS = "alpha-intel.deaddrop.eth";
const TOTAL_EARNINGS = "1,450 USDC";

const ACTIVE_LISTINGS: Listing[] = [
  {
    id: "listing-01",
    title: "Q3 DeFi Exploit Alpha",
    price: "240 USDC",
    purchases: 12,
    teeScore: 92,
  },
  {
    id: "listing-02",
    title: "Cross-Chain MEV Flow Map",
    price: "310 USDC",
    purchases: 7,
    teeScore: 86,
  },
  {
    id: "listing-03",
    title: "Institutional Wallet Behavior",
    price: "190 USDC",
    purchases: 19,
    teeScore: 94,
  },
];

export default function MyAgentsPage() {
  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-[#1F232B] bg-[#0E1116]/90 p-6 shadow-[0_0_50px_rgba(57,255,136,0.1)]">
          <p className="text-xs uppercase tracking-[0.4em] text-[#6B7280]">
            Vendor Identities & Datasets
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Vendor Identities & Datasets
          </h1>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#1F232B] bg-[#0E1116] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
              Active Vendor ENS
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {VENDOR_ENS}
            </p>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              Verified data seller identity.
            </p>
          </div>
          <div className="rounded-2xl border border-[#1F232B] bg-[#0E1116] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
              Total Earnings
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#39FF88]">
              {TOTAL_EARNINGS}
            </p>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              Accrued from x402 data unlocks.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-[#1F232B] bg-[#0E1116] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upload Encrypted Dataset</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
              0G Storage
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-[#9CA3AF]">
              Dataset File
              <input
                type="file"
                className="w-full rounded-lg border border-[#1D2330] bg-[#0B0F14] px-3 py-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#0F172A] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#7DD3FC]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#9CA3AF]">
              Dataset Title
              <input
                type="text"
                placeholder="Encrypted Alpha Pack"
                className="w-full rounded-lg border border-[#1D2330] bg-[#0B0F14] px-3 py-2 text-sm text-white placeholder:text-[#4B5563]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#9CA3AF]">
              Price (USDC)
              <input
                type="text"
                placeholder="250"
                className="w-full rounded-lg border border-[#1D2330] bg-[#0B0F14] px-3 py-2 text-sm text-white placeholder:text-[#4B5563]"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                className="w-full rounded-lg border border-[#1C3B52] bg-[#081826] px-4 py-2 text-sm font-semibold text-[#7DD3FC] transition hover:border-[#39FF88] hover:text-[#39FF88]"
              >
                Seal & Upload to 0G Storage
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Listings</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
              Live Datasets
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {ACTIVE_LISTINGS.map((listing) => (
              <article
                key={listing.id}
                className="rounded-2xl border border-[#1F232B] bg-[#0E1116] p-5 transition hover:-translate-y-0.5 hover:border-[#952AFF] hover:shadow-[0_0_35px_rgba(149,42,255,0.2)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {listing.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#9CA3AF]">
                      Purchased {listing.purchases} times
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
                      0G TEE
                    </p>
                    <p className="text-2xl font-semibold text-[#39FF88]">
                      {listing.teeScore}
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-[#1C2634] bg-[#0B0F14] px-3 py-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
                    Price
                  </p>
                  <p className="mt-1 font-mono text-sm text-[#7DD3FC]">
                    {listing.price}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

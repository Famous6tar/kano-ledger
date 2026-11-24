import { formatMoney, relativeDay } from "@/lib/format";

export function BalanceHero({ outstanding, retailers, retailersWithBalance, lastActivity, collectedToday }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 100% 0%, hsl(var(--brand) / 0.35) 0%, hsl(var(--brand) / 0.08) 36%, transparent 68%)",
        }}
      />
      <div className="relative">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Total outstanding
        </p>
        <p className="tnum mt-2 font-display text-4xl leading-none tracking-tight text-foreground sm:text-5xl">
          {formatMoney(outstanding)}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-brand-foreground">
            Owing
          </span>
          <span className="text-xs text-muted-foreground">
            {retailersWithBalance} of {retailers} retailer{retailers === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-background/60 p-4 backdrop-blur">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Collected today
            </p>
            <p className="tnum mt-1 font-heading text-lg font-bold text-foreground">
              {formatMoney(collectedToday)}
            </p>
          </div>
          <div className="rounded-2xl bg-background/60 p-4 backdrop-blur">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Last activity
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {lastActivity ? relativeDay(lastActivity) : "No activity yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
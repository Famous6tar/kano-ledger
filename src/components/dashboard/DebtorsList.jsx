import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { formatMoney, initials } from "@/lib/format";

export function DebtorsList({ customers = [] }) {
  return (
    <div className="card-surface overflow-hidden">
      <header className="border-b border-border/70 px-5 py-4">
        <h2 className="font-heading text-base font-bold tracking-tight text-foreground">
          Top balances
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Retailers who still owe the most</p>
      </header>

      {customers.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          No outstanding balances — everyone is settled.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {customers.map((c) => (
            <li key={c.id}>
              <Link
                to="/customers/$customerId"
                params={{ customerId: c.id }}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/12 font-heading text-xs font-bold text-brand">
                  {initials(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="truncate text-[0.7rem] text-muted-foreground">
                    {c.phone || "No phone"}
                  </p>
                </div>
                <p className="tnum shrink-0 text-sm font-bold text-foreground">
                  {formatMoney(Math.max(0, c.balance))}
                </p>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border/60 px-5 py-3">
        <Link
          to="/customers"
          className="text-xs font-semibold text-brand underline-offset-4 hover:underline"
        >
          See all retailers →
        </Link>
      </div>
    </div>
  );
}
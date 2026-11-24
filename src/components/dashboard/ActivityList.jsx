import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatMoney, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ActivityList({ transactions, emptyLabel = "No transactions yet" }) {
  return (
    <section className="card-surface overflow-hidden">
      <header className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground">Recent activity</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Every credit and repayment, newest first</p>
        </div>
      </header>

      {transactions.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {transactions.map((t) => {
            const isCredit = t.type === "credit";
            const Icon = isCredit ? ArrowUpRight : ArrowDownLeft;
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40 sm:px-6"
              >
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                    isCredit ? "bg-amber-500/12 text-amber-600 dark:text-amber-400" : "bg-brand/12 text-brand"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight text-foreground">
                    {t.customer_name}
                  </p>
                  <p className="truncate text-[0.72rem] text-muted-foreground">
                    {t.note || (isCredit ? "Credit sale" : "Payment received")} · {relativeDay(t.date)}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className={cn(
                      "tnum text-sm font-bold leading-tight",
                      isCredit ? "text-amber-600 dark:text-amber-400" : "text-brand"
                    )}
                  >
                    {isCredit ? "+" : "−"}
                    {formatMoney(t.amount)}
                  </p>
                  <p className="tnum text-[0.7rem] text-muted-foreground">
                    bal {formatMoney(t.balance_after)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
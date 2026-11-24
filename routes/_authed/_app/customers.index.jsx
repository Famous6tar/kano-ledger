import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Search, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { useShop } from "@/hooks/useShop";
import { formatMoney, initials, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/_app/customers/")({
  head: () => ({ meta: [{ title: "Retailers · Kanti" }] }),
  component: CustomersPage,
});

function CustomersSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-48 animate-pulse rounded-3xl bg-muted/60" />
      ))}
    </div>
  );
}

function CustomersPage() {
  const { summary, loading, reload } = useShop();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return summary.customers;
    return summary.customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone || "").includes(q)
    );
  }, [summary.customers, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger"
        title="Retailers"
        description="Every business partner you sell to on credit, with the balance they still owe."
        actions={
          <Button
            className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => setOpen(true)}
          >
            <UserPlus className="mr-1.5 h-4 w-4" /> Add retailer
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone"
          className="h-11 rounded-full pl-10"
        />
      </div>

      {loading ? (
        <CustomersSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "No retailer matches that search" : "No retailers yet"}
          description={
            query
              ? "Try another name or phone number."
              : "Add the shops and partners you supply, then start recording credit sales and repayments."
          }
          action={
            !query && (
              <Button
                className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={() => setOpen(true)}
              >
                <UserPlus className="mr-1.5 h-4 w-4" /> Add your first retailer
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to="/customers/$customerId"
              params={{ customerId: c.id }}
              className="card-surface group flex flex-col gap-4 p-5 transition-shadow hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_28px_50px_-38px_rgba(16,24,40,0.5)]"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand/12 font-heading text-sm font-bold text-brand">
                  {initials(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-[0.95rem] font-bold leading-tight text-foreground">
                    {c.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{c.phone || "No phone saved"}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>

              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Balance
                  </p>
                  <p
                    className={cn(
                      "tnum mt-1 font-heading text-xl font-extrabold tracking-tight",
                      c.balance > 0 ? "text-foreground" : "text-brand"
                    )}
                  >
                    {formatMoney(Math.max(0, c.balance))}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em]",
                    c.balance > 0
                      ? "bg-amber-500/12 text-amber-700 dark:text-amber-400"
                      : "bg-brand/12 text-brand"
                  )}
                >
                  {c.balance > 0 ? "Owing" : "Settled"}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-[0.7rem] text-muted-foreground">
                <span>Last activity</span>
                <span className="font-medium text-foreground/70">{relativeDay(c.last_activity)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CustomerDialog open={open} onOpenChange={setOpen} onSaved={reload} />
    </div>
  );
}
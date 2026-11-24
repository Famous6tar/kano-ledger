import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { BalanceHero } from "@/components/dashboard/BalanceHero";
import { DebtorsList } from "@/components/dashboard/DebtorsList";
import { FlowChart } from "@/components/dashboard/FlowChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { useBrand } from "@/components/brand/BrandProvider";
import { useShop } from "@/hooks/useShop";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_authed/_app/")({
  head: () => ({ meta: [{ title: "Overview · Kanti" }] }),
  component: DashboardPage,
});

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-muted/60" />
      <div className="h-64 animate-pulse rounded-[2rem] bg-muted/60" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-3xl bg-muted/60" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-muted/60" />
    </div>
  );
}

function DashboardPage() {
  const { brand } = useBrand();
  const { summary, loading, reload } = useShop();
  const [customerOpen, setCustomerOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);

  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={today}
        title="Overview"
        description={`Everything owed to ${brand.business_name} right now, and every naira that moved this month.`}
        actions={
          <>
            <Button variant="outline" className="rounded-full" onClick={() => setCustomerOpen(true)}>
              <UserPlus className="mr-1.5 h-4 w-4" /> Add retailer
            </Button>
            <Button
              className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={() => setTransactionOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" /> New transaction
            </Button>
          </>
        }
      />

      {summary.retailers === 0 && (
        <div className="card-surface flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="font-heading text-base font-bold tracking-tight text-foreground">
              Start with the shops you supply
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first retailer, then record what they take on credit.
            </p>
          </div>
          <Button
            className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => setCustomerOpen(true)}
          >
            <UserPlus className="mr-1.5 h-4 w-4" /> Add retailer
          </Button>
        </div>
      )}

      <BalanceHero
        outstanding={summary.outstanding}
        retailers={summary.retailers}
        retailersWithBalance={summary.retailersWithBalance}
        lastActivity={summary.lastActivity}
        collectedToday={summary.collectedToday}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Collected this month"
          value={summary.collectedMonth}
          format={(v) => formatMoney(v)}
          details={[
            { label: "Credit given", value: formatMoney(summary.creditMonth) },
            { label: "Net", value: formatMoney(summary.collectedMonth - summary.creditMonth) },
          ]}
        />
        <StatCard
          label="Retailers with a balance"
          value={summary.retailersWithBalance}
          details={[
            { label: "Total retailers", value: summary.retailers },
            { label: "Settled", value: summary.retailers - summary.retailersWithBalance },
          ]}
        />
        <StatCard
          label="Average balance"
          value={summary.retailersWithBalance ? summary.outstanding / summary.retailersWithBalance : 0}
          format={(v) => formatMoney(v)}
          details={[
            { label: "Largest", value: formatMoney(summary.withBalance[0]?.balance || 0) },
            { label: "Transactions", value: summary.transactions.length },
          ]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <FlowChart data={summary.flow} />
        <DebtorsList customers={summary.withBalance.slice(0, 5)} />
      </div>

      <ActivityList transactions={summary.transactions.slice(0, 6)} />

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Link to="/transactions" className="font-semibold text-brand underline-offset-4 hover:underline">
          Open the full ledger
        </Link>
        <span aria-hidden="true">·</span>
        <Link to="/customers" className="font-semibold text-brand underline-offset-4 hover:underline">
          See all retailers
        </Link>
      </div>

      <CustomerDialog open={customerOpen} onOpenChange={setCustomerOpen} onSaved={reload} />
      <TransactionDialog
        open={transactionOpen}
        onOpenChange={setTransactionOpen}
        customers={summary.customers}
        onSaved={reload}
      />
    </div>
  );
}
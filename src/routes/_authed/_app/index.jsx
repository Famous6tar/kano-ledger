import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus, UserPlus, ShoppingCart } from "lucide-react";
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
import { base44 } from "@/api/base44Client";
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
        {[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-muted/60" />)}
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

  const [salesToday, setSalesToday] = useState(0);
  const [expensesMonth, setExpensesMonth] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [loadingPos, setLoadingPos] = useState(true);

  useEffect(() => {
    async function loadPosData() {
      try {
        const [salesRes, expRes, prodRes] = await Promise.all([
          base44.entities.Sale.list({ sort: "-created_date", limit: 100 }),
          base44.entities.Expense.list({ sort: "-date", limit: 100 }),
          base44.entities.Product.list({ sort: "stock_quantity", limit: 100 })
        ]);

        // 🔑 FIX: Use local dates for comparison
        const todayLocal = new Date().toLocaleDateString("en-CA");
        const monthLocal = todayLocal.slice(0, 7); // YYYY-MM

        const sales = salesRes.items || [];
        const expenses = expRes.items || [];
        const products = prodRes.items || [];

        setSalesToday(sales.filter(s => new Date(s.date).toLocaleDateString("en-CA") === todayLocal).reduce((sum, s) => sum + s.total, 0));
        setExpensesMonth(expenses.filter(e => e.date.startsWith(monthLocal)).reduce((sum, e) => sum + e.amount, 0));
        setLowStock(products.filter(p => p.stock_quantity <= 5).length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPos(false);
      }
    }
    loadPosData();
  }, []);

  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  }).format(new Date());

  if (loading || loadingPos) return <DashboardSkeleton />;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={today}
        title="Dashboard"
        description={`Welcome back to ${brand.business_name}. Here is your daily snapshot.`}
        actions={
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" className="rounded-full w-full sm:w-auto" onClick={() => setCustomerOpen(true)}>
              <UserPlus className="mr-1.5 h-4 w-4" /> Add Customer
            </Button>
            <Link to="/pos" className="w-full sm:w-auto">
              <Button className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90 w-full">
                <ShoppingCart className="mr-1.5 h-4 w-4" /> Open POS
              </Button>
            </Link>
          </div>
        }
      />

      {summary.retailers === 0 && (
        <div className="card-surface flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="font-heading text-base font-bold tracking-tight text-foreground">Start with the shops you supply</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first retailer, then record what they take on credit.</p>
          </div>
          <Button className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setCustomerOpen(true)}>
            <UserPlus className="mr-1.5 h-4 w-4" /> Add Retailer
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

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="POS Sales Today"
          value={salesToday}
          format={(v) => formatMoney(v)}
          details={[
            { label: "Total Debt Owed", value: formatMoney(summary.outstanding) },
            { label: "Collected Today", value: formatMoney(summary.collectedToday) },
          ]}
        />
        <StatCard
          label="Expenses (This Month)"
          value={expensesMonth}
          format={(v) => formatMoney(v)}
          details={[
            { label: "Credit Given", value: formatMoney(summary.creditMonth) },
            { label: "Net Flow", value: formatMoney(summary.collectedMonth - expensesMonth) },
          ]}
        />
        <div className="card-surface p-5 relative overflow-hidden">
           {lowStock > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 rounded-bl-full" />}
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Inventory Alerts</p>
          <p className="tnum mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground">
            {lowStock} <span className="text-sm font-medium text-muted-foreground">items low on stock</span>
          </p>
          <dl className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
            <Link to="/products" className="flex items-center justify-between text-xs text-brand hover:underline">
              <dt>View Inventory</dt>
              <dd>→</dd>
            </Link>
            <Link to="/expenses" className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground">
              <dt>Record Expense</dt>
              <dd>→</dd>
            </Link>
          </dl>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <FlowChart data={summary.flow} />
        <DebtorsList customers={summary.withBalance.slice(0, 5)} />
      </div>

      <ActivityList transactions={summary.transactions.slice(0, 6)} />

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Link to="/sales" className="font-semibold text-brand underline-offset-4 hover:underline">View all sales & invoices</Link>
        <span aria-hidden="true">·</span>
        <Link to="/customers" className="font-semibold text-brand underline-offset-4 hover:underline">See all customers</Link>
      </div>

      <CustomerDialog open={customerOpen} onOpenChange={setCustomerOpen} onSaved={reload} />
      <TransactionDialog open={transactionOpen} onOpenChange={setTransactionOpen} customers={summary.customers} onSaved={reload} />
    </div>
  );
}
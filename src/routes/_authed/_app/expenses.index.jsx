import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TrendingDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ExpenseDialog } from "@/components/expenses/ExpenseDialog";
import { base44 } from "@/api/base44Client";
import { formatMoney, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/_app/expenses/")({
  head: () => ({ meta: [{ title: "Expenses · Kanti" }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = () => {
    base44.entities.Expense.list({ sort: "-date" }).then(res => {
      setExpenses(res.items || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Expenses"
        description="Track money going out of the business."
        actions={
          <Button className="rounded-full bg-brand text-brand-foreground w-full sm:w-auto" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Expense
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2.5">{[0, 1, 2].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/60" />)}</div>
      ) : expenses.length === 0 ? (
        <EmptyState icon={TrendingDown} title="No expenses yet" description="Record your first expense to track outflows." />
      ) : (
        <>
          {/* 📱 MOBILE VIEW: Cards */}
          <div className="md:hidden space-y-3">
            {expenses.map((e) => (
              <div key={e.id} className="card-surface p-4 flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-sm text-foreground">{e.title}</p>
                  <p className="text-[0.7rem] text-muted-foreground">{e.category} · {formatDate(e.date)}</p>
                </div>
                <p className="tnum font-bold text-destructive text-lg">-{formatMoney(e.amount)}</p>
              </div>
            ))}
          </div>

          {/* 💻 DESKTOP VIEW: Table */}
          <div className="hidden md:block overflow-hidden rounded-3xl border border-border/70 bg-card">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/70 text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground bg-muted/20">
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {expenses.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-muted/40">
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-foreground">{formatDate(e.date)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{e.title}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{e.category}</td>
                    <td className="tnum whitespace-nowrap px-5 py-3.5 text-right text-sm font-bold text-destructive">
                      -{formatMoney(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ExpenseDialog open={open} onOpenChange={setOpen} onSaved={load} />
    </div>
  );
}
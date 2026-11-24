import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Plus, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { ReceiptDialog } from "@/components/receipts/ReceiptDialog";
import { useBrand } from "@/components/brand/BrandProvider";
import { useShop } from "@/hooks/useShop";
import { formatMoney, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/_app/transactions/")({
  head: () => ({ meta: [{ title: "Transactions · Kanti" }] }),
  component: TransactionsPage,
});

const FILTERS = [
  { key: "all", label: "All" },
  { key: "credit", label: "Credit given" },
  { key: "payment", label: "Payments" },
];

function TransactionsPage() {
  const { brand } = useBrand();
  const { summary, loading, reload } = useShop();
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const rows = useMemo(
    () => summary.transactions.filter((t) => filter === "all" || t.type === filter),
    [summary.transactions, filter]
  );

  const customerOf = (transaction) =>
    summary.customers.find((c) => c.id === transaction.customer_id) || null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger"
        title="Transactions"
        description="Credit sales and repayments, stamped with the balance left after each one."
        actions={
          <Button
            className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" /> New transaction
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-border/70 bg-card p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              filter === f.key
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={filter === "all" ? "No transactions yet" : "Nothing in this view"}
          description="Record a credit sale when a retailer takes goods, and a payment when they settle."
          action={
            <Button
              className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={() => setOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Record the first one
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-3xl border border-border/70 bg-card md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/70 text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Retailer</th>
                  <th className="px-5 py-3 font-semibold">Details</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th className="px-5 py-3 text-right font-semibold">Balance</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((t) => {
                  const isCredit = t.type === "credit";
                  return (
                    <tr key={t.id} className="transition-colors hover:bg-muted/40">
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-foreground">
                        {relativeDay(t.date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-foreground">{t.customer_name}</p>
                        <p className="text-[0.7rem] text-muted-foreground">{t.reference}</p>
                      </td>
                      <td className="max-w-[240px] px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em]",
                            isCredit
                              ? "bg-amber-500/12 text-amber-700 dark:text-amber-400"
                              : "bg-brand/12 text-brand"
                          )}
                        >
                          {isCredit ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                          {isCredit ? "Credit" : "Payment"}
                        </span>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{t.note}</p>
                      </td>
                      <td
                        className={cn(
                          "tnum whitespace-nowrap px-5 py-3.5 text-right text-sm font-bold",
                          isCredit ? "text-amber-600 dark:text-amber-400" : "text-brand"
                        )}
                      >
                        {isCredit ? "+" : "−"}
                        {formatMoney(t.amount)}
                      </td>
                      <td className="tnum whitespace-nowrap px-5 py-3.5 text-right text-sm font-semibold text-foreground">
                        {formatMoney(t.balance_after)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setReceipt(t)}
                          className="rounded-full border border-border px-3 py-1 text-[0.68rem] font-semibold text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2.5 md:hidden">
            {rows.map((t) => {
              const isCredit = t.type === "credit";
              return (
                <li key={t.id} className="card-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{t.customer_name}</p>
                      <p className="truncate text-[0.7rem] text-muted-foreground">
                        {t.note || (isCredit ? "Credit sale" : "Payment")} · {relativeDay(t.date)}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "tnum shrink-0 text-sm font-bold",
                        isCredit ? "text-amber-600 dark:text-amber-400" : "text-brand"
                      )}
                    >
                      {isCredit ? "+" : "−"}
                      {formatMoney(t.amount)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
                    <span className="text-[0.68rem] text-muted-foreground">
                      Balance {formatMoney(t.balance_after)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setReceipt(t)}
                      className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-brand"
                    >
                      Receipt
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <TransactionDialog
        open={open}
        onOpenChange={setOpen}
        customers={summary.customers}
        onSaved={reload}
      />

      <ReceiptDialog
        open={!!receipt}
        onOpenChange={(next) => !next && setReceipt(null)}
        kind="receipt"
        transaction={receipt}
        customer={receipt ? customerOf(receipt) : null}
        allTransactions={
          receipt
            ? summary.transactions.filter((t) => t.customer_id === receipt.customer_id)
            : []
        }
        brand={brand}
      />
    </div>
  );
}
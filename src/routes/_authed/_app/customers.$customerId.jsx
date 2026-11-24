import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { ReceiptDialog } from "@/components/receipts/ReceiptDialog";
import { EmptyState } from "@/components/EmptyState";
import { useBrand } from "@/components/brand/BrandProvider";
import { useShop } from "@/hooks/useShop";
import { deleteTransaction } from "@/lib/shop";
import { formatMoney, initials, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/_app/customers/$customerId")({
  head: () => ({ meta: [{ title: "Retailer account · Kanti" }] }),
  component: CustomerPage,
});

function CustomerPage() {
  const { customerId } = Route.useParams();
  const { brand } = useBrand();
  const { summary, loading, reload } = useShop();
  const [txOpen, setTxOpen] = useState(false);
  const [txType, setTxType] = useState("payment");
  const [receipt, setReceipt] = useState(null);
  const [statement, setStatement] = useState(false);

  const customer = summary.customers.find((c) => c.id === customerId) || null;
  const entries = useMemo(
    () => summary.transactions.filter((t) => t.customer_id === customerId),
    [summary.transactions, customerId]
  );

  const remove = async (transaction) => {
    try {
      await deleteTransaction(transaction);
      toast.success("Entry removed");
      reload();
    } catch (error) {
      toast.error(error?.message || "Could not remove the entry");
    }
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-3xl bg-muted/60" />;
  }

  if (!customer) {
    return (
      <EmptyState
        icon={ArrowLeft}
        title="Retailer not found"
        description="This account may have been removed."
        action={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/customers">Back to retailers</Link>
          </Button>
        }
      />
    );
  }

  const openWith = (type) => {
    setTxType(type);
    setTxOpen(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <Link
        to="/customers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All retailers
      </Link>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand/12 font-heading text-base font-bold text-brand">
            {initials(customer.name)}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
              {customer.name}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {[customer.phone, customer.address].filter(Boolean).join(" · ") || "No contact saved"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => setStatement(true)}>
            <FileText className="mr-1.5 h-4 w-4" /> Statement
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => openWith("credit")}>
            <ArrowUpRight className="mr-1.5 h-4 w-4" /> Credit
          </Button>
          <Button
            className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => openWith("payment")}
          >
            <ArrowDownLeft className="mr-1.5 h-4 w-4" /> Payment
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-5">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 120% at 100% 0%, hsl(var(--brand) / 0.3) 0%, hsl(var(--brand) / 0.08) 36%, transparent 68%)",
            }}
          />
          <p className="relative text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Balance owing
          </p>
          <p className="tnum relative mt-2 font-display text-3xl leading-none tracking-tight text-foreground">
            {formatMoney(Math.max(0, customer.balance))}
          </p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Total credit
          </p>
          <p className="tnum mt-2 font-heading text-xl font-extrabold tracking-tight text-foreground">
            {formatMoney(customer.total_credit || 0)}
          </p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Total paid
          </p>
          <p className="tnum mt-2 font-heading text-xl font-extrabold tracking-tight text-foreground">
            {formatMoney(customer.total_paid || 0)}
          </p>
        </div>
      </div>

      <section className="card-surface overflow-hidden">
        <header className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div>
            <h2 className="font-heading text-base font-bold tracking-tight text-foreground">Account ledger</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Every entry for this retailer</p>
          </div>
          <span className="text-xs text-muted-foreground">{entries.length} entries</span>
        </header>

        {entries.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nothing recorded yet — start with a credit sale.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {entries.map((t) => {
              const isCredit = t.type === "credit";
              return (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                      isCredit ? "bg-amber-500/12 text-amber-600 dark:text-amber-400" : "bg-brand/12 text-brand"
                    )}
                  >
                    {isCredit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight text-foreground">
                      {t.note || (isCredit ? "Credit sale" : "Payment received")}
                    </p>
                    <p className="truncate text-[0.7rem] text-muted-foreground">
                      {t.reference} · {relativeDay(t.date)}
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

                  <div className="ml-1 flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setReceipt(t)}
                      aria-label="Open receipt"
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          aria-label="Delete entry"
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove this entry?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {formatMoney(t.amount)} will come off this retailer's ledger and the balance will
                            be recalculated.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">Keep it</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-full bg-destructive text-destructive-foreground"
                            onClick={() => remove(t)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <TransactionDialog
        open={txOpen}
        onOpenChange={setTxOpen}
        customers={summary.customers}
        defaultCustomerId={customer.id}
        defaultType={txType}
        onSaved={reload}
      />

      <ReceiptDialog
        open={!!receipt}
        onOpenChange={(next) => !next && setReceipt(null)}
        kind="receipt"
        transaction={receipt}
        customer={customer}
        allTransactions={entries}
        brand={brand}
      />

      <ReceiptDialog
        open={statement}
        onOpenChange={setStatement}
        kind="statement"
        customer={customer}
        transactions={entries}
        brand={brand}
      />
    </div>
  );
}
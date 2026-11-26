import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Search, UserPlus, Users, Edit2, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { useShop } from "@/hooks/useShop";
import { deleteCustomer } from "@/lib/shop";
import { formatMoney, initials, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authed/_app/customers/")({
  head: () => ({ meta: [{ title: "Retailers · Kanti" }] }),
  component: CustomersPage,
});

function CustomersSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-3xl bg-muted/60" />)}
    </div>
  );
}

function CustomersPage() {
  const { summary, loading, reload } = useShop();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return summary.customers;
    return summary.customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone || "").includes(q)
    );
  }, [summary.customers, query]);

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    if (deletingCustomer.balance > 0) {
      toast.error("Cannot delete a customer with an outstanding balance.");
      setDeletingCustomer(null);
      return;
    }
    try {
      await deleteCustomer(deletingCustomer.id);
      toast.success("Customer deleted");
      reload();
    } catch (err) {
      toast.error(err?.message || "Failed to delete customer");
    } finally {
      setDeletingCustomer(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger"
        title="Retailers"
        description="Every business partner you sell to on credit, with the balance they still owe."
        actions={
          <Button className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => { setEditingCustomer(null); setOpen(true); }}>
            <UserPlus className="mr-1.5 h-4 w-4" /> Add retailer
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or phone" className="h-11 rounded-full pl-10" />
      </div>

      {loading ? (
        <CustomersSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "No retailer matches that search" : "No retailers yet"}
          description={query ? "Try another name or phone number." : "Add the shops and partners you supply, then start recording credit sales and repayments."}
          action={
            !query && (
              <Button className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => { setEditingCustomer(null); setOpen(true); }}>
                <UserPlus className="mr-1.5 h-4 w-4" /> Add your first retailer
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="card-surface group relative flex flex-col gap-4 p-5">
              {/* Menu Button */}
              <div className="absolute top-4 right-4 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => { setEditingCustomer(c); setOpen(true); }}>
                      <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingCustomer(c)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link to="/customers/$customerId" params={{ customerId: c.id }} className="flex items-start gap-3 pr-8">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand/12 font-heading text-sm font-bold text-brand">
                  {initials(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-[0.95rem] font-bold leading-tight text-foreground hover:text-brand transition-colors">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.phone || "No phone saved"}</p>
                </div>
              </Link>

              <Link to="/customers/$customerId" params={{ customerId: c.id }} className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Balance</p>
                  <p className={cn("tnum mt-1 font-heading text-xl font-extrabold tracking-tight", c.balance > 0 ? "text-foreground" : "text-brand")}>
                    {formatMoney(Math.max(0, c.balance))}
                  </p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em]", c.balance > 0 ? "bg-amber-500/12 text-amber-700 dark:text-amber-400" : "bg-brand/12 text-brand")}>
                  {c.balance > 0 ? "Owing" : "Settled"}
                </span>
              </Link>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-[0.7rem] text-muted-foreground">
                <span>Last activity</span>
                <span className="font-medium text-foreground/70">{relativeDay(c.last_activity)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <CustomerDialog 
        open={open} 
        onOpenChange={setOpen} 
        onSaved={reload} 
        customer={editingCustomer} 
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingCustomer?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer and their transaction history. This cannot be undone.
              {deletingCustomer?.balance > 0 && (
                <span className="block mt-2 font-bold text-destructive">
                  ⚠️ This customer owes {formatMoney(deletingCustomer.balance)}. You must settle their balance before deleting.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
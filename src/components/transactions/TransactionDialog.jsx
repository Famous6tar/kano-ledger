import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransaction } from "@/lib/shop";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

function nowLocalInput() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export function TransactionDialog({
  open,
  onOpenChange,
  customers = [],
  defaultCustomerId,
  defaultType = "credit",
  onSaved,
}) {
  const [customerId, setCustomerId] = useState("");
  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(nowLocalInput());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCustomerId(defaultCustomerId || "");
    setType(defaultType);
    setAmount("");
    setNote("");
    setDate(nowLocalInput());
  }, [open, defaultCustomerId, defaultType]);

  const customer = useMemo(
    () => customers.find((c) => c.id === customerId) || null,
    [customers, customerId]
  );

  const projected = customer
    ? type === "credit"
      ? Math.max(0, customer.balance) + (Number(amount) || 0)
      : Math.max(0, Math.max(0, customer.balance) - (Number(amount) || 0))
    : 0;

  const submit = async (event) => {
    event.preventDefault();
    if (!customer || !(Number(amount) > 0)) return;
    setSaving(true);
    try {
      await createTransaction({ customer, type, amount, note, date });
      toast.success(type === "credit" ? "Credit recorded" : "Payment recorded");
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.message || "Could not record the transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl tracking-tight">New transaction</DialogTitle>
          <DialogDescription>
            Record goods taken on credit, or a repayment received.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-1">
            {[
              { key: "credit", label: "Credit given", icon: ArrowUpRight },
              { key: "payment", label: "Payment in", icon: ArrowDownLeft },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setType(option.key)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                    type === option.key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {option.label}
                </button>
              );
            })}
          </div>

          <div>
            <Label>Retailer</Label>
            <Select value={customerId} onValueChange={setCustomerId} disabled={!!defaultCustomerId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={customers.length ? "Choose a retailer" : "Add a retailer first"} />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tx-amount">Amount (₦)</Label>
              <Input
                id="tx-amount"
                type="number"
                inputMode="decimal"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="mt-1.5 tnum"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="tx-date">Date &amp; time</Label>
              <Input
                id="tx-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tx-note">What was it for</Label>
            <Textarea
              id="tx-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="6 cartons of detergent"
              className="mt-1.5"
            />
          </div>

          {customer && (
            <div className="flex items-center justify-between rounded-2xl bg-brand/8 px-4 py-3 text-xs">
              <span className="text-muted-foreground">Balance after this entry</span>
              <span className="tnum font-heading text-sm font-bold text-foreground">
                {formatMoney(projected)}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !customer || !(Number(amount) > 0)}
              className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {saving ? "Saving…" : "Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
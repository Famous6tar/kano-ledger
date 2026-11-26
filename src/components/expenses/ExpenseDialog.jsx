import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

export function ExpenseDialog({ open, onOpenChange, onSaved }) {
  const [values, setValues] = useState({ title: "", amount: 0, category: "General", date: new Date().toISOString().split("T")[0], note: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setValues({ title: "", amount: 0, category: "General", date: new Date().toISOString().split("T")[0], note: "" });
  }, [open]);

  const update = (patch) => setValues((prev) => ({ ...prev, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    if (!values.title.trim() || values.amount <= 0) return;
    setSaving(true);
    try {
      await base44.entities.Expense.create(values);
      toast.success("Expense recorded");
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Expense Title</Label>
            <Input value={values.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Shop Rent" className="mt-1.5" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount (₦)</Label>
              <Input type="number" min="1" value={values.amount} onChange={(e) => update({ amount: Number(e.target.value) })} className="mt-1.5" required />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={values.date} onChange={(e) => update({ date: e.target.value })} className="mt-1.5" required />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Input value={values.category} onChange={(e) => update({ category: e.target.value })} placeholder="e.g. Utilities, Salary" className="mt-1.5" />
          </div>
          <Button type="submit" disabled={saving} className="w-full h-11 bg-brand text-brand-foreground">
            {saving ? "Saving..." : "Save Expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCustomer, updateCustomer } from "@/lib/shop";

const EMPTY = { name: "", phone: "", address: "", notes: "" };

export function CustomerDialog({ open, onOpenChange, onSaved, customer }) {
  const [values, setValues] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(customer ? { name: customer.name, phone: customer.phone || "", address: customer.address || "", notes: customer.notes || "" } : EMPTY);
    }
  }, [open, customer]);

  const update = (patch) => setValues((prev) => ({ ...prev, ...patch }));

  const submit = async (event) => {
    event.preventDefault();
    if (!values.name.trim()) return;
    setSaving(true);
    try {
      if (customer) {
        await updateCustomer(customer.id, values);
        toast.success("Customer updated");
      } else {
        await createCustomer(values);
        toast.success("Customer added");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.message || "Could not save the customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl tracking-tight">{customer ? "Edit Customer" : "Add a retailer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update the details for this customer." : "The shops and partners you supply on credit. Their balance starts at zero."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="customer-name">Business name</Label>
            <Input id="customer-name" value={values.name} onChange={(e) => update({ name: e.target.value })} placeholder="Aisha General Store" className="mt-1.5" autoFocus />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer-phone">Phone</Label>
              <Input id="customer-phone" value={values.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+234 …" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="customer-address">Location</Label>
              <Input id="customer-address" value={values.address} onChange={(e) => update({ address: e.target.value })} placeholder="Kofar Wambai" className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="customer-notes">Notes</Label>
            <Textarea id="customer-notes" value={values.notes} onChange={(e) => update({ notes: e.target.value })} rows={2} placeholder="Payment terms, contact person…" className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !values.name.trim()} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              {saving ? "Saving…" : (customer ? "Save Changes" : "Save retailer")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
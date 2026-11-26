import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

export function ProductDialog({ open, onOpenChange, onSaved, product }) {
  const [values, setValues] = useState({ name: "", sku: "", category: "General", cost_price: 0, price: 0, stock_quantity: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (product) setValues(product);
      else setValues({ name: "", sku: "", category: "General", cost_price: 0, price: 0, stock_quantity: 0 });
    }
  }, [open, product]);

  const update = (patch) => setValues((prev) => ({ ...prev, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    if (!values.name.trim()) return;
    setSaving(true);
    try {
      if (product) await base44.entities.Product.update(product.id, values);
      else await base44.entities.Product.create(values);
      toast.success(product ? "Product updated" : "Product added");
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input value={values.name} onChange={(e) => update({ name: e.target.value })} className="mt-1.5" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SKU / Barcode</Label>
              <Input value={values.sku || ""} onChange={(e) => update({ sku: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={values.category} onChange={(e) => update({ category: e.target.value })} className="mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cost Price (₦)</Label>
              <Input type="number" min="0" value={values.cost_price} onChange={(e) => update({ cost_price: Number(e.target.value) })} className="mt-1.5" />
            </div>
            <div>
              <Label>Selling Price (₦)</Label>
              <Input type="number" min="0" value={values.price} onChange={(e) => update({ price: Number(e.target.value) })} className="mt-1.5" required />
            </div>
          </div>
          <div>
            <Label>Stock Quantity</Label>
            <Input type="number" value={values.stock_quantity} onChange={(e) => update({ stock_quantity: Number(e.target.value) })} className="mt-1.5" />
          </div>
          <Button type="submit" disabled={saving} className="w-full h-11 bg-brand text-brand-foreground">
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
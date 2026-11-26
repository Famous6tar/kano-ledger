import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { createTransaction } from "@/lib/shop";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function InvoiceDialog({ open, onOpenChange, customers = [], onSaved }) {
  const [customerId, setCustomerId] = useState("");
  // 🔑 Fix: Get local YYYY-MM-DD instead of UTC
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA")); 
  const [items, setItems] = useState([{ name: "", qty: 1, price: 0 }]);
  const [amountPaid, setAmountPaid] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCustomerId("");
      setItems([{ name: "", qty: 1, price: 0 }]);
      setAmountPaid("0");
      setDate(new Date().toLocaleDateString("en-CA"));
    }
  }, [open]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: "", qty: 1, price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const total = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
  const paid = Number(amountPaid) || 0;
  const balance = Math.max(0, total - paid);

  const submit = async (e) => {
    e.preventDefault();
    if (!customerId) return toast.error("Please select a customer");
    if (items.some(i => !i.name || i.qty <= 0 || i.price <= 0)) return toast.error("Please fill all item details correctly");

    setSaving(true);
    try {
      const customer = customers.find(c => c.id === customerId);
      const saleNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const parsedItems = items.map(i => ({
        name: i.name,
        qty: Number(i.qty),
        price: Number(i.price),
        total: Number(i.qty) * Number(i.price)
      }));

      const status = balance === 0 ? "PAID" : (paid > 0 ? "PARTIAL" : "UNPAID");
      
      // 🔑 Fix: Add T12:00:00 to prevent timezone from shifting the date
      const localISODate = new Date(`${date}T12:00:00`).toISOString();

      // 1. Create the Sale (Invoice)
      await base44.entities.Sale.create({
        customer_id: customerId,
        sale_number: saleNumber,
        type: "invoice",
        status: status,
        items_json: JSON.stringify(parsedItems),
        sub_total: total,
        total: total,
        amount_paid: paid,
        balance: balance,
        payment_method: "Credit",
        date: localISODate,
        due_date: localISODate
      });

      // 2. Update Ledger
      await createTransaction({
        customer,
        type: "credit",
        amount: total,
        note: `Invoice #${saleNumber} - Goods`,
        date: localISODate
      });

      if (paid > 0) {
        await createTransaction({
          customer,
          type: "payment",
          amount: paid,
          note: `Invoice #${saleNumber} - Deposit`,
          date: localISODate
        });
      }

      toast.success("Invoice generated and added to ledger");
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.message || "Could not save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl tracking-tight">Create Manual Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Invoice Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1.5" />
            </div>
          </div>

          <div className="border rounded-xl p-4 bg-muted/20">
            <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-muted-foreground">
              <div className="col-span-6">Item Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-3">Price (₦)</div>
              <div className="col-span-1"></div>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                <div className="col-span-6"><Input placeholder="e.g. 5 Cartons of Milk" value={item.name} onChange={e => updateItem(index, "name", e.target.value)} /></div>
                <div className="col-span-2"><Input type="number" min="1" value={item.qty} onChange={e => updateItem(index, "qty", e.target.value)} /></div>
                <div className="col-span-3"><Input type="number" min="1" value={item.price} onChange={e => updateItem(index, "price", e.target.value)} /></div>
                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2">
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-6 bg-muted/10 p-4 rounded-xl border">
            <div className="text-left flex-1 w-full sm:w-auto">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-foreground">{formatMoney(total)}</p>
            </div>
            <div className="w-full sm:w-32">
              <Label className="text-xs">Amount Paid (₦)</Label>
              <Input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className="mt-1 font-bold" />
            </div>
            <div className="w-full sm:w-32">
              <Label className="text-xs">Balance Due</Label>
              <div className={cn("mt-1 h-10 flex items-center px-3 rounded-md font-bold border", balance > 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-brand/10 text-brand border-brand/20")}>
                {formatMoney(balance)}
              </div>
            </div>
            <Button type="submit" disabled={saving} className="h-12 px-8 rounded-full bg-brand text-brand-foreground hover:bg-brand/90 mt-5 w-full sm:w-auto">
              {saving ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
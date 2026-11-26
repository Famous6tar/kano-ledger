import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ShoppingCart, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useShop } from "@/hooks/useShop";
import { createTransaction } from "@/lib/shop";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/_app/pos")({
  head: () => ({ meta: [{ title: "POS · Kanti" }] }),
  component: POSPage,
});

function POSPage() {
  const { summary, reload } = useShop();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    base44.entities.Product.list({ sort: "name" }).then(res => setProducts(res.items || []));
  };

  useEffect(() => { loadProducts(); }, []);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.includes(search)));

  const addToCart = (product) => {
    if (product.stock_quantity <= 0 && !product.id.startsWith("custom-")) return toast.error("Out of stock");
    const existing = cart.find(i => i.product.id === product.id);
    if (existing) {
      setCart(cart.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
  };

  const addCustomItem = () => {
    const name = prompt("Enter item name (or leave blank for 'Custom Item'):");
    if (name === null) return;
    const priceStr = prompt("Enter price (₦):");
    const price = Number(priceStr);
    if (!price || price <= 0) return toast.error("Invalid price");

    addToCart({
      id: `custom-${Date.now()}`,
      name: name.trim() || "Custom Item",
      price: price,
      stock_quantity: 9999
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return setCart(cart.filter(i => i.product.id !== id));
    setCart(cart.map(i => i.product.id === id ? { ...i, qty } : i));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const paid = Number(amountPaid) || 0;
  const balance = Math.max(0, total - paid);

  useEffect(() => {
    if (cart.length > 0) setAmountPaid(total.toString());
    else setAmountPaid("");
  }, [total]);

  const checkout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (balance > 0 && !customerId) return toast.error("You must select a customer to record a debt.");
    
    setSaving(true);
    try {
      const saleNumber = `POS-${Math.floor(100000 + Math.random() * 900000)}`;
      const itemsJson = cart.map(i => ({
        product_id: i.product.id,
        name: i.product.name,
        qty: i.qty,
        price: i.product.price,
        total: i.product.price * i.qty
      }));

      const customer = summary.customers.find(c => c.id === customerId);
      const status = balance === 0 ? "PAID" : (paid > 0 ? "PARTIAL" : "UNPAID");

      await base44.entities.Sale.create({
        customer_id: customerId || null,
        sale_number: saleNumber,
        type: "pos",
        status: status,
        items_json: JSON.stringify(itemsJson),
        sub_total: total,
        total: total,
        amount_paid: paid,
        balance: balance,
        payment_method: paymentMethod,
        date: new Date().toISOString()
      });

      for (const item of cart) {
        if (!item.product.id.startsWith("custom-")) {
          await base44.entities.Product.update(item.product.id, {
            stock_quantity: item.product.stock_quantity - item.qty
          });
        }
      }

      if (customer) {
        await createTransaction({ customer, type: "credit", amount: total, note: `POS Sale #${saleNumber} - Goods`, date: new Date().toISOString() });
        if (paid > 0) await createTransaction({ customer, type: "payment", amount: paid, note: `POS Sale #${saleNumber} - Deposit`, date: new Date().toISOString() });
      }

      toast.success(balance > 0 ? "Sale recorded with balance owing" : "Sale completed");
      setCart([]);
      setCustomerId("");
      setAmountPaid("");
      reload();
      loadProducts();
    } catch (err) {
      toast.error(err?.message || "Checkout failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    // 🔑 Stack vertically on mobile, side-by-side on large screens
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-6rem)] gap-6 pb-6">
      
      {/* Products Area */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search products or scan barcode..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="h-12 pl-10 rounded-full text-base"
              autoFocus
            />
          </div>
          <Button onClick={addCustomItem} className="h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 px-6">
            <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Custom Item</span><span className="sm:hidden">Item</span>
          </Button>
        </div>
        
        {/* Product Grid: adapts columns based on screen size */}
        <div className="h-[40vh] lg:h-auto overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
          {filteredProducts.map(p => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock_quantity <= 0}
              className={cn(
                "card-surface p-3 sm:p-4 text-left flex flex-col justify-between h-28 sm:h-32 transition-all hover:ring-2 hover:ring-brand/50 disabled:opacity-50",
                p.stock_quantity <= 0 && "grayscale"
              )}
            >
              <div>
                <p className="font-bold text-xs sm:text-sm leading-tight text-foreground line-clamp-2">{p.name}</p>
                <p className="text-[0.6rem] text-muted-foreground mt-1">{p.category}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full">
                <span className="font-heading font-bold text-brand text-sm sm:text-base">{formatMoney(p.price)}</span>
                <span className="text-[0.6rem] text-muted-foreground">{p.stock_quantity} left</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Area: Full width on mobile, fixed width on desktop */}
      <div className="w-full lg:w-[400px] flex flex-col card-surface h-auto lg:h-full shrink-0">
        <div className="p-4 sm:p-5 border-b border-border/70">
          <h2 className="font-heading text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand" /> Current Order
          </h2>
        </div>

        <div className="max-h-[30vh] lg:max-h-none lg:flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 py-8">
              <ShoppingCart className="h-10 w-10 mb-2" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-3 items-center">
                <div className="flex-1">
                  <p className="font-semibold text-sm leading-tight line-clamp-1">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatMoney(item.product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center font-bold">-</button>
                  <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center font-bold">+</button>
                  <button onClick={() => updateQty(item.product.id, 0)} className="text-destructive ml-1 p-1"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-border/70 bg-muted/10 space-y-3 rounded-b-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="h-10 bg-background text-xs"><SelectValue placeholder="Walk-in Customer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Walk-in</SelectItem>
                {summary.customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-10 bg-background text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
                <SelectItem value="POS">POS Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-border/60">
            <span className="text-sm font-semibold text-muted-foreground">Total</span>
            <span className="tnum font-heading text-xl sm:text-2xl font-extrabold text-foreground">{formatMoney(total)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[0.7rem] text-muted-foreground">Amount Paid (₦)</Label>
              <Input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className="mt-1 h-10 font-bold tnum text-sm" />
            </div>
            <div>
              <Label className="text-[0.7rem] text-muted-foreground">Balance Due</Label>
              <div className={cn("mt-1 h-10 flex items-center px-3 rounded-md font-bold tnum border text-sm", balance > 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-brand/10 text-brand border-brand/20")}>
                {formatMoney(balance)}
              </div>
            </div>
          </div>

          <Button onClick={checkout} disabled={saving || cart.length === 0 || (balance > 0 && !customerId)} className="w-full h-12 sm:h-14 mt-2 rounded-full bg-brand text-brand-foreground text-base sm:text-lg hover:bg-brand/90">
            {saving ? "Processing..." : (balance > 0 ? `Charge & Record Debt` : `Charge ${formatMoney(total)}`)}
          </Button>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Package, Plus, Edit2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ProductDialog } from "@/components/inventory/ProductDialog";
import { base44 } from "@/api/base44Client";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_authed/_app/products/")({
  head: () => ({ meta: [{ title: "Inventory · Kanti" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Product.list({ sort: "name" });
      setProducts(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Inventory"
        description="Manage your products, prices, and stock levels."
        actions={
          <Button className="rounded-full bg-brand text-brand-foreground w-full sm:w-auto" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Product
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2.5">{[0,1,2].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/60" />)}</div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add your first product to start selling." action={<Button onClick={() => setDialogOpen(true)}>Add Product</Button>} />
      ) : (
        <>
          {/* 📱 MOBILE VIEW: Clean Cards */}
          <div className="md:hidden space-y-3">
            {products.map((p) => (
              <div key={p.id} className="card-surface p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-bold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku || "No SKU"} · {p.category}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-1 rounded-full text-[0.65rem] font-bold ${p.stock_quantity <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-brand/10 text-brand'}`}>
                    {p.stock_quantity <= 5 && <AlertCircle className="w-3 h-3 mr-1" />}
                    {p.stock_quantity} in stock
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-1">
                  <div>
                    <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-semibold">Price</p>
                    <p className="font-bold text-lg text-foreground">{formatMoney(p.price)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setEditing(p); setDialogOpen(true); }} className="rounded-full">
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 💻 DESKTOP VIEW: Table */}
          <div className="hidden md:block overflow-hidden rounded-3xl border border-border/70 bg-card">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/70 text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground bg-muted/20">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">SKU</th>
                  <th className="px-5 py-3 text-right font-semibold">Cost</th>
                  <th className="px-5 py-3 text-right font-semibold">Price</th>
                  <th className="px-5 py-3 text-right font-semibold">Stock</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{p.name}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{p.sku || "—"}</td>
                    <td className="tnum px-5 py-3.5 text-right text-xs text-muted-foreground">{formatMoney(p.cost_price)}</td>
                    <td className="tnum px-5 py-3.5 text-right text-sm font-bold text-foreground">{formatMoney(p.price)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${p.stock_quantity <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-brand/10 text-brand'}`}>
                        {p.stock_quantity <= 5 && <AlertCircle className="w-3 h-3 mr-1" />}
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setDialogOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} product={editing} />
    </div>
  );
}
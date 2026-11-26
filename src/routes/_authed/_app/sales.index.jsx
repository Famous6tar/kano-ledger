import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ReceiptText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { InvoicePreviewDialog } from "@/components/receipts/InvoicePreviewDialog";
import { InvoiceDialog } from "@/components/transactions/InvoiceDialog";
import { useBrand } from "@/components/brand/BrandProvider";
import { useShop } from "@/hooks/useShop";
import { base44 } from "@/api/base44Client";
import { formatMoney, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/_app/sales/")({
  head: () => ({ meta: [{ title: "Sales · Kanti" }] }),
  component: SalesPage,
});

function SalesPage() {
  const { brand } = useBrand();
  const { summary, reload } = useShop();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const loadSales = () => {
    setLoading(true);
    base44.entities.Sale.list({ sort: "-created_date" }).then(res => {
      setSales(res.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadSales(); }, []);

  const customerOf = (id) => summary.customers.find(c => c.id === id) || null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Sales & Invoices"
        description="View all POS receipts and generated invoices."
        actions={
          <Button className="rounded-full bg-brand text-brand-foreground w-full sm:w-auto" onClick={() => setInvoiceOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New Manual Invoice
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2.5">{[0, 1, 2].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/60" />)}</div>
      ) : sales.length === 0 ? (
        <EmptyState icon={ReceiptText} title="No sales yet" description="Create a sale from the POS terminal or generate a manual invoice." />
      ) : (
        <>
          {/* 📱 MOBILE VIEW: Cards */}
          <div className="md:hidden space-y-3">
            {sales.map((sale) => {
              const cust = customerOf(sale.customer_id);
              return (
                <div key={sale.id} className="card-surface p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-foreground">{cust?.name || "Walk-in Customer"}</p>
                      <p className="text-[0.7rem] text-muted-foreground">{sale.sale_number} · {formatDate(sale.date)}</p>
                    </div>
                    <span className="text-[0.65rem] uppercase font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {sale.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/60">
                    <p className="tnum font-bold text-lg text-foreground">{formatMoney(sale.total)}</p>
                    <Button variant="outline" size="sm" onClick={() => setSelectedSale(sale)} className="rounded-full">
                      View Receipt
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 💻 DESKTOP VIEW: Table */}
          <div className="hidden md:block overflow-hidden rounded-3xl border border-border/70 bg-card">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/70 text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground bg-muted/20">
                  <th className="px-5 py-3 font-semibold">Ref #</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sales.map((sale) => {
                  const cust = customerOf(sale.customer_id);
                  return (
                    <tr key={sale.id} className="transition-colors hover:bg-muted/40">
                      <td className="whitespace-nowrap px-5 py-3.5 text-sm font-bold text-foreground">{sale.sale_number}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-foreground">{formatDate(sale.date)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{cust?.name || "Walk-in"}</td>
                      <td className="px-5 py-3.5 text-xs uppercase font-bold text-muted-foreground">{sale.type}</td>
                      <td className="tnum whitespace-nowrap px-5 py-3.5 text-right text-sm font-bold text-foreground">{formatMoney(sale.total)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button type="button" onClick={() => setSelectedSale(sale)} className="rounded-full border border-border px-3 py-1 text-[0.68rem] font-semibold text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <InvoicePreviewDialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)} sale={selectedSale} customer={selectedSale ? customerOf(selectedSale.customer_id) : null} brand={brand} />
      <InvoiceDialog open={invoiceOpen} onOpenChange={setInvoiceOpen} customers={summary.customers} onSaved={() => { loadSales(); reload(); }} />
    </div>
  );
}
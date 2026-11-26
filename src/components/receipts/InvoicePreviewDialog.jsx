import { useEffect, useRef, useState } from "react";
import { Download, FileText, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoicePaper } from "@/components/receipts/InvoicePaper";
import { exportPdf, exportPng, sharePng, toDataUrl } from "@/lib/receipt-export";
import { formatMoney } from "@/lib/format";

export function InvoicePreviewDialog({ open, onOpenChange, sale, customer, brand }) {
  const paperRef = useRef(null);
  const [logo, setLogo] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let alive = true;
    if (!open || !brand?.logo_url) {
      setLogo("");
      return () => { alive = false; };
    }
    toDataUrl(brand.logo_url).then((data) => alive && setLogo(data)).catch(() => alive && setLogo(""));
    return () => { alive = false; };
  }, [open, brand?.logo_url]);

  const baseName = `receipt-${sale?.sale_number || "draft"}`;

  const run = async (label, task, success) => {
    if (!paperRef.current) return;
    setBusy(label);
    try {
      await task();
      if (success) toast.success(success);
    } catch (error) {
      toast.error(error?.message || "Could not prepare the file");
    } finally {
      setBusy("");
    }
  };

  const share = () =>
    run("share", async () => {
      const shared = await sharePng(paperRef.current, `${baseName}.png`, `Receipt #${sale?.sale_number} for ${customer?.name || "Walk-in"} — Total ${formatMoney(sale?.total || 0)}`);
      if (!shared) toast.success("Image downloaded — share it from your files");
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-4xl overflow-y-auto rounded-3xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg tracking-tight">
            {sale?.type === 'pos' ? 'Receipt' : 'Invoice'} #{sale?.sale_number}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-2xl bg-muted/50 p-2 sm:p-4 overflow-x-auto">
          <InvoicePaper innerRef={paperRef} brand={brand} customer={customer} sale={sale} logo={logo} />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Button variant="outline" className="rounded-full text-xs" disabled={!!busy} onClick={() => run("png", () => exportPng(paperRef.current, `${baseName}.png`), "Image saved")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> {busy === "png" ? "…" : "Image"}
          </Button>
          <Button variant="outline" className="rounded-full text-xs" disabled={!!busy} onClick={() => run("pdf", () => exportPdf(paperRef.current, `${baseName}.pdf`), "PDF saved")}>
            <FileText className="mr-1.5 h-3.5 w-3.5" /> {busy === "pdf" ? "…" : "PDF"}
          </Button>
          <Button className="rounded-full bg-brand text-xs text-brand-foreground hover:bg-brand/90" disabled={!!busy} onClick={share}>
            <Share2 className="mr-1.5 h-3.5 w-3.5" /> {busy === "share" ? "…" : "Share"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
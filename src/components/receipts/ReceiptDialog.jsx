import { useEffect, useRef, useState } from "react";
import { Download, FileText, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReceiptPaper } from "@/components/receipts/ReceiptPaper";
import { StatementPaper } from "@/components/receipts/StatementPaper";
import { exportPdf, exportPng, generatePdfBlob, sharePdfBlob, toDataUrl, downloadBlob } from "@/lib/receipt-export";
import { fetchTransactions } from "@/lib/shop";
import { formatMoney } from "@/lib/format";

export function ReceiptDialog({ open, onOpenChange, kind = "receipt", transaction, customer, transactions, allTransactions, brand }) {
  const paperRef = useRef(null);
  const [logo, setLogo] = useState("");
  const [busy, setBusy] = useState("");
  const [history, setHistory] = useState([]);
  const [pdfBlob, setPdfBlob] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!open || !brand?.logo_url) {
      setLogo("");
      return () => { alive = false; };
    }
    toDataUrl(brand.logo_url).then((data) => alive && setLogo(data)).catch(() => alive && setLogo(""));
    return () => { alive = false; };
  }, [open, brand?.logo_url]);

  useEffect(() => {
    if (!open || kind === "statement" || !customer?.id) {
      setHistory([]);
      return;
    }
    if (Array.isArray(allTransactions)) {
      setHistory(allTransactions);
      return;
    }
    let alive = true;
    fetchTransactions(customer.id).then((rows) => { if (alive) setHistory(Array.isArray(rows) ? rows : []); }).catch(() => { if (alive) setHistory([]); });
    return () => { alive = false; };
  }, [open, kind, customer?.id, allTransactions]);

  // 🔑 Pre-generate the PDF in the background
  useEffect(() => {
    if (!open) {
      setPdfBlob(null);
      return;
    }
    const timer = setTimeout(async () => {
      if (paperRef.current) {
        try {
          const blob = await generatePdfBlob(paperRef.current);
          setPdfBlob(blob);
        } catch (err) {
          console.error("Pre-generation failed", err);
        }
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [open, transaction, history, logo, kind]);

  const isStatement = kind === "statement";
  const baseName = isStatement
    ? `statement-${(customer?.name || "account").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : `receipt-${transaction?.reference || "entry"}`;

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

  const share = async () => {
    if (!pdfBlob) {
      toast.error("Preparing PDF... Please wait 2 seconds and try again.");
      return;
    }
    const shared = await sharePdfBlob(pdfBlob, `${baseName}.pdf`, isStatement ? `Statement for ${customer?.name}` : `Receipt ${transaction?.reference} — ${formatMoney(transaction?.amount || 0)}`);
    if (!shared) {
      toast.error("Sharing not supported. Downloading instead.");
      downloadBlob(pdfBlob, `${baseName}.pdf`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl p-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg tracking-tight">
            {isStatement ? "Account statement" : "Receipt"}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-2xl bg-muted/50 p-3">
          {isStatement ? (
            <StatementPaper innerRef={paperRef} brand={brand} customer={customer} transactions={transactions || []} logo={logo} />
          ) : (
            <ReceiptPaper innerRef={paperRef} brand={brand} transaction={transaction} customer={customer} logo={logo} history={history} />
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="rounded-full text-xs" disabled={!!busy} onClick={() => run("png", () => exportPng(paperRef.current, `${baseName}.png`), "Image saved")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> {busy === "png" ? "…" : "Picture"}
          </Button>
          <Button variant="outline" className="rounded-full text-xs" disabled={!!busy} onClick={() => run("pdf", () => exportPdf(paperRef.current, `${baseName}.pdf`), "PDF saved")}>
            <FileText className="mr-1.5 h-3.5 w-3.5" /> {busy === "pdf" ? "…" : "PDF"}
          </Button>
          <Button className="rounded-full bg-brand text-xs text-brand-foreground hover:bg-brand/90" disabled={!!busy} onClick={share}>
            <Share2 className="mr-1.5 h-3.5 w-3.5" /> {busy === "share" ? "…" : "Share PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
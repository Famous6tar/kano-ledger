import { formatDate, formatMoney } from "@/lib/format";

const INK = "#101613";
const MUTED = "#6B7280";
const LINE = "#E7E4DA";

export function InvoicePaper({ innerRef, brand, customer, sale, logo }) {
  const brandColor = brand?.brand_color || "#0E7C66";
  const items = sale?.items_json ? JSON.parse(sale.items_json) : [];
  const bankDetails = brand?.bank_details || "Bank details not configured in settings.";

  return (
    <div
      ref={innerRef}
      style={{
        width: "100%", maxWidth: 800, margin: "0 auto", background: "#FFFFFF",
        color: INK, fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        padding: 40, boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
        <div>
          {logo ? (
            <img src={logo} alt="Logo" style={{ height: 60, objectFit: "contain", marginBottom: 10 }} />
          ) : (
            <div style={{ width: 60, height: 60, background: brandColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, fontWeight: "bold", fontSize: 24 }}>
              {brand?.business_name?.substring(0, 2).toUpperCase() || "KB"}
            </div>
          )}
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: INK }}>{brand?.business_name || "Your Business"}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: MUTED }}>{brand?.address || "Kano, Nigeria"}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>Tel: {brand?.phone || "—"}</p>
        </div>
        
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0, fontSize: 20, letterSpacing: 1, color: MUTED }}>{sale?.type === 'pos' ? 'RECEIPT' : 'INVOICE'} #{sale?.sale_number}</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: MUTED }}>Created: {formatDate(sale?.date)}</p>
          <span style={{ display: "inline-block", marginTop: 8, padding: "4px 8px", background: sale?.status === "PAID" ? "#DEF7EC" : "#FDE8E8", color: sale?.status === "PAID" ? "#03543F" : "#9B1C1C", borderRadius: 4, fontSize: 10, fontWeight: "bold" }}>
            {sale?.status}
          </span>
        </div>
      </div>

      <div style={{ height: 2, background: brandColor, marginBottom: 30 }} />

      <div style={{ display: "flex", gap: 40, marginBottom: 30 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: MUTED }}>To:</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: INK }}>{customer?.name || "Walk-in Customer"}</p>
          {customer?.address && <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{customer.address}</p>}
          {customer?.phone && <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{customer.phone}</p>}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${INK}`, textAlign: "left" }}>
            <th style={{ padding: "10px 0", fontSize: 12, fontWeight: 700 }}>Item</th>
            <th style={{ padding: "10px 0", fontSize: 12, fontWeight: 700, textAlign: "center" }}>Qty</th>
            <th style={{ padding: "10px 0", fontSize: 12, fontWeight: 700, textAlign: "right" }}>Price</th>
            <th style={{ padding: "10px 0", fontSize: 12, fontWeight: 700, textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: `1px solid ${LINE}` }}>
              <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 600 }}>{item.name}</td>
              <td style={{ padding: "12px 0", fontSize: 13, textAlign: "center" }}>{item.qty}</td>
              <td style={{ padding: "12px 0", fontSize: 13, textAlign: "right" }}>{formatMoney(item.price)}</td>
              <td style={{ padding: "12px 0", fontSize: 13, textAlign: "right", fontWeight: 600 }}>{formatMoney(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
        <div style={{ flex: 1, paddingRight: 40 }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: MUTED }}>Payment Details:</p>
          <p style={{ margin: 0, fontSize: 12, color: INK, whiteSpace: "pre-line" }}>{bankDetails}</p>
        </div>
        
        <div style={{ width: 300 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
            <span style={{ color: MUTED }}>Sub-Total</span>
            <span style={{ fontWeight: 600 }}>{formatMoney(sale?.sub_total)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, margin: "8px 0", fontSize: 16, fontWeight: 800 }}>
            <span>Total</span>
            <span>{formatMoney(sale?.total)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
            <span style={{ color: MUTED }}>Amount Paid</span>
            <span style={{ fontWeight: 600, color: brandColor }}>{formatMoney(sale?.amount_paid || 0)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14, fontWeight: 800, color: sale?.balance > 0 ? "#B45309" : brandColor }}>
            <span>Balance</span>
            <span>{formatMoney(sale?.balance)}</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", borderTop: `1px solid ${LINE}`, paddingTop: 20, fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>
        Generated Using {brand?.business_name || "Kanti"} | Powered by Famous6tar Infotech Ltd
      </div>
    </div>
  );
}
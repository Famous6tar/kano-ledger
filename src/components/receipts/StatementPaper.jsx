import { formatDate, formatMoney, initials } from "@/lib/format";

const INK = "#101613";
const MUTED = "#6B7280";
const LINE = "#E7E4DA";

export function StatementPaper({ innerRef, brand, customer, transactions = [], logo }) {
  const brandColor = brand?.brand_color || "#0E7C66";
  const pending = transactions.filter((t) => t.type === "credit").slice(0, 8);
  const outstanding = Math.max(0, Number(customer?.balance) || 0);

  return (
    <div
      ref={innerRef}
      style={{
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        background: "#FFFFFF",
        color: INK,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        padding: 26,
        boxSizing: "border-box",
        borderRadius: 18,
        border: `1px solid ${LINE}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
          {logo ? (
            <img
              src={logo}
              alt=""
              style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 12, border: `1px solid ${LINE}` }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: brandColor,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {initials(brand?.business_name || "Shop")}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
              {brand?.business_name || "Your business"}
            </p>
            {brand?.phone ? <p style={{ margin: "2px 0 0", fontSize: 10.5, color: MUTED }}>{brand.phone}</p> : null}
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: brandColor,
            fontWeight: 700,
            textAlign: "right",
          }}
        >
          Statement
        </p>
      </div>

      <div style={{ height: 3, background: brandColor, borderRadius: 999, margin: "18px 0" }} />

      <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
        Account of
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 700 }}>{customer?.name || "—"}</p>
      <p style={{ margin: "2px 0 0", fontSize: 10.5, color: MUTED }}>
        Issued {formatDate(new Date())}
        {customer?.phone ? ` · ${customer.phone}` : ""}
      </p>

      <div
        style={{
          marginTop: 16,
          borderRadius: 12,
          background: `${brandColor}14`,
          border: `1px solid ${brandColor}33`,
          padding: "14px 16px",
        }}
      >
        <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: brandColor }}>
          Outstanding balance
        </p>
        <p style={{ margin: "5px 0 0", fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: brandColor }}>
          {formatMoney(outstanding, { precise: true })}
        </p>
      </div>

      <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse", fontSize: 10.5 }}>
        <thead>
          <tr style={{ color: MUTED, textAlign: "left" }}>
            <th style={{ paddingBottom: 6, fontWeight: 600 }}>Date</th>
            <th style={{ paddingBottom: 6, fontWeight: 600 }}>Item</th>
            <th style={{ paddingBottom: 6, fontWeight: 600, textAlign: "right" }}>Credit</th>
          </tr>
        </thead>
        <tbody>
          {pending.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ paddingTop: 10, color: MUTED }}>
                No credit entries recorded.
              </td>
            </tr>
          ) : (
            pending.map((t) => (
              <tr key={t.id} style={{ borderTop: `1px solid ${LINE}` }}>
                <td style={{ padding: "7px 0", color: MUTED, whiteSpace: "nowrap" }}>{formatDate(t.date)}</td>
                <td style={{ padding: "7px 8px", color: INK }}>{t.note || "Credit sale"}</td>
                <td style={{ padding: "7px 0", textAlign: "right", fontWeight: 600 }}>
                  {formatMoney(t.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div
        style={{
          marginTop: 16,
          paddingTop: 10,
          borderTop: `1px solid ${LINE}`,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 9,
          color: MUTED,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span>{brand?.address || ""}</span>
        <span>Powered by Kanti</span>
      </div>
    </div>
  );
}
import { formatDate, formatTime, formatMoney, initials } from "@/lib/format";

const INK = "#101613";
const MUTED = "#6B7280";
const LINE = "#E7E4DA";

function Header({ brand, logo, label, reference }) {
  const brandColor = brand?.brand_color || "#0E7C66";
  return (
    <>
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
                color: "#FFFFFF",
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
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: INK }}>
              {brand?.business_name || "Your business"}
            </p>
            {brand?.tagline ? (
              <p style={{ margin: "2px 0 0", fontSize: 10.5, color: MUTED }}>{brand.tagline}</p>
            ) : null}
            {brand?.phone ? (
              <p style={{ margin: "2px 0 0", fontSize: 10.5, color: MUTED }}>{brand.phone}</p>
            ) : null}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: brandColor, fontWeight: 700 }}>
            {label}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: MUTED }}>{reference}</p>
        </div>
      </div>
      <div style={{ height: 3, background: brandColor, borderRadius: 999, margin: "18px 0" }} />
    </>
  );
}

export function ReceiptPaper({ innerRef, brand, transaction, customer, logo, history = [] }) {
  const brandColor = brand?.brand_color || "#0E7C66";
  const isCredit = transaction?.type === "credit";

  const timeline = [...history]
    .filter(Boolean)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const showHistory = timeline.length > 1;

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
      <Header brand={brand} logo={logo} label="Receipt" reference={transaction?.reference || "—"} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 11, color: MUTED }}>
        <div>
          <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" }}>Date</p>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: INK, fontWeight: 600 }}>{formatDate(transaction?.date)}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" }}>Time</p>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: INK, fontWeight: 600 }}>{formatTime(transaction?.date)}</p>
        </div>
      </div>

      <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${LINE}` }}>
        <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>Retailer</p>
        <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: INK }}>
          {customer?.name || transaction?.customer_name || "—"}
        </p>
        {customer?.phone ? <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED }}>{customer.phone}</p> : null}
      </div>

      <div style={{ marginTop: 16, padding: "14px 16px", background: "#F7F6F1", borderRadius: 12, border: `1px solid ${LINE}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 11 }}>
          <span style={{ color: MUTED }}>{isCredit ? "Goods on credit" : "Payment received"}</span>
          <span style={{ color: INK, fontWeight: 600 }}>{transaction?.reference || "—"}</span>
        </div>
        {transaction?.note ? (
          <p style={{ margin: "6px 0 0", fontSize: 11, color: MUTED, lineHeight: 1.5 }}>{transaction.note}</p>
        ) : null}
        <p style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: isCredit ? INK : brandColor }}>
          {formatMoney(transaction?.amount || 0, { precise: true })}
        </p>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "14px 16px",
          borderRadius: 12,
          background: `${brandColor}14`,
          border: `1px solid ${brandColor}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: brandColor }}>
            Remaining balance
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 10.5, color: MUTED }}>
            {Number(transaction?.balance_after) > 0 ? "Still owing on this account" : "Account settled in full"}
          </p>
        </div>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: brandColor }}>
          {formatMoney(transaction?.balance_after || 0, { precise: true })}
        </p>
      </div>

      {showHistory && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: brandColor, fontWeight: 700 }}>
              Account history
            </p>
            <span style={{ fontSize: 9, color: MUTED }}>{timeline.length} entries</span>
          </div>
          <p style={{ margin: "3px 0 6px", fontSize: 9.5, color: MUTED }}>
            Every entry since the first owing
          </p>

          {timeline.map((t, i) => {
            const credit = t.type === "credit";
            const isCurrent = t.id === transaction?.id;
            return (
              <div
                key={t.id || i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "8px 0",
                  borderTop: `1px solid ${LINE}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 10.5,
                      fontWeight: isCurrent ? 700 : 600,
                      color: INK,
                      wordBreak: "break-word",
                      lineHeight: 1.4, // 🔑 Fix html2canvas clipping
                    }}
                  >
                    {t.note || (credit ? "Credit sale" : "Payment received")}
                    {isCurrent ? " · this receipt" : ""}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: MUTED, lineHeight: 1.4 }}>
                    {formatDate(t.date)} · {formatTime(t.date)}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      fontWeight: 700,
                      color: credit ? "#B45309" : brandColor,
                      lineHeight: 1.4, // 🔑 Fix html2canvas clipping
                    }}
                  >
                    {credit ? "+" : "−"}
                    {formatMoney(t.amount)}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: MUTED, lineHeight: 1.4 }}>
                    bal {formatMoney(t.balance_after)}
                  </p>
                </div>
              </div>
            );
          })}

          <p style={{ margin: "10px 0 0", fontSize: 9, color: MUTED, textAlign: "center" }}>
            Opening balance: ₦0.00 · Current balance: {formatMoney(customer?.balance || 0, { precise: true })}
          </p>
        </div>
      )}

      {brand?.receipt_note ? (
        <p style={{ margin: "18px 0 0", fontSize: 10.5, lineHeight: 1.6, color: MUTED }}>{brand.receipt_note}</p>
      ) : null}

      <div
        style={{
          marginTop: 18,
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
        <span>{brand?.address || brand?.business_name || ""}</span>
        <span>Powered by Kanti</span>
      </div>
    </div>
  );
}
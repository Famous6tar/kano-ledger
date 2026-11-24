const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const moneyPrecise = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value, { precise = false } = {}) {
  const n = Number(value) || 0;
  return precise ? moneyPrecise.format(n) : money.format(n);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-NG").format(Number(value) || 0);
}

export function formatCompactMoney(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `₦${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}m`;
  if (abs >= 1_000) return `₦${Math.round(n / 1_000)}k`;
  return `₦${Math.round(n)}`;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const weekdayFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });

export function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value) {
  const d = toDate(value);
  return d ? dateFmt.format(d) : "—";
}

export function formatTime(value) {
  const d = toDate(value);
  return d ? timeFmt.format(d) : "";
}

export function formatShortDate(value) {
  const d = toDate(value);
  return d ? weekdayFmt.format(d) : "—";
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "—";
  return `${dateFmt.format(d)} · ${timeFmt.format(d)}`;
}

export function relativeDay(value) {
  const d = toDate(value);
  if (!d) return "—";
  const now = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diff === 0) return `Today · ${timeFmt.format(d)}`;
  if (diff === 1) return `Yesterday · ${timeFmt.format(d)}`;
  if (diff < 7) return `${weekdayFmt.format(d)} · ${timeFmt.format(d)}`;
  return `${dateFmt.format(d)} · ${timeFmt.format(d)}`;
}

export function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "·";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function monthKey(value) {
  const d = toDate(value);
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
import { toDate } from "@/lib/format";

export function isCredit(t) {
  return t.type === "credit";
}

export function sumAmounts(list) {
  return list.reduce((total, t) => total + (Number(t.amount) || 0), 0);
}

export function balanceOf(customer, transactions = []) {
  return transactions
    .filter((t) => t.customer_id === customer.id)
    .reduce((total, t) => total + (isCredit(t) ? Number(t.amount) || 0 : -(Number(t.amount) || 0)), 0);
}

export function inMonth(value, reference = new Date()) {
  const d = toDate(value);
  if (!d) return false;
  return d.getFullYear() === reference.getFullYear() && d.getMonth() === reference.getMonth();
}

export function inDay(value, reference = new Date()) {
  const d = toDate(value);
  if (!d) return false;
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
}

export function buildDailyFlow(transactions, days = 14, reference = new Date()) {
  const buckets = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() - i);
    buckets.push({
      key: day.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(day),
      credit: 0,
      paid: 0,
    });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));

  transactions.forEach((t) => {
    const d = toDate(t.date);
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const bucket = byKey.get(key);
    if (!bucket) return;
    if (isCredit(t)) bucket.credit += Number(t.amount) || 0;
    else bucket.paid += Number(t.amount) || 0;
  });

  return buckets;
}

export function buildSummary({ customers = [], transactions = [] }) {
  const sorted = [...transactions].sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0));
  const enriched = customers.map((c) => ({
    ...c,
    balance: balanceOf(c, transactions),
  }));

  const outstanding = enriched.reduce((total, c) => total + Math.max(0, c.balance), 0);
  const withBalance = enriched.filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance);

  return {
    transactions: sorted,
    customers: enriched,
    outstanding,
    withBalance,
    retailers: enriched.length,
    retailersWithBalance: withBalance.length,
    collectedMonth: sumAmounts(sorted.filter((t) => !isCredit(t) && inMonth(t.date))),
    creditMonth: sumAmounts(sorted.filter((t) => isCredit(t) && inMonth(t.date))),
    collectedToday: sumAmounts(sorted.filter((t) => !isCredit(t) && inDay(t.date))),
    lastActivity: sorted[0]?.date || null,
    flow: buildDailyFlow(sorted),
  };
}
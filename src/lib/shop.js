import { base44 } from "@/api/base44Client";

export async function fetchProfile() {
  const page = await base44.entities.BusinessProfile.list({ limit: 1, sort: "-created_date" });
  return page.items?.[0] || null;
}

export async function saveProfile(values) {
  const payload = {
    business_name: values.business_name,
    tagline: values.tagline || "",
    logo_url: values.logo_url || "",
    brand_color: values.brand_color || "#0E7C66",
    accent_color: values.accent_color || "#D97706",
    phone: values.phone || "",
    email: values.email || "",
    address: values.address || "",
    currency: values.currency || "NGN",
    receipt_note: values.receipt_note || "",
    bank_details: values.bank_details || "",
  };
  if (values.id) return base44.entities.BusinessProfile.update(values.id, payload);
  return base44.entities.BusinessProfile.create(payload);
}

export async function fetchCustomers() {
  const page = await base44.entities.Customer.list({ limit: 500, sort: "name" });
  return page.items || [];
}

export async function fetchTransactions(customerId) {
  const page = customerId
    ? await base44.entities.Transaction.filter({ customer_id: customerId }, { limit: 500, sort: "-date" })
    : await base44.entities.Transaction.list({ limit: 500, sort: "-date" });
  return page.items || [];
}

export async function createCustomer(values) {
  return base44.entities.Customer.create({
    name: values.name,
    phone: values.phone || "",
    address: values.address || "",
    notes: values.notes || "",
    balance: 0,
    total_credit: 0,
    total_paid: 0,
    last_activity: new Date().toISOString(),
  });
}

// 🔑 New functions
export async function updateCustomer(id, values) {
  return base44.entities.Customer.update(id, {
    name: values.name,
    phone: values.phone || "",
    address: values.address || "",
    notes: values.notes || "",
  });
}

export async function deleteCustomer(id) {
  return base44.entities.Customer.delete(id);
}

export async function recalcCustomer(customerId) {
  const transactions = await fetchTransactions(customerId);
  const totalCredit = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalPaid = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  await base44.entities.Customer.update(customerId, {
    total_credit: totalCredit,
    total_paid: totalPaid,
    balance: Math.max(0, totalCredit - totalPaid),
    last_activity: transactions[0]?.date || new Date().toISOString(),
  });
}

export async function createTransaction({ customer, type, amount, note, date }) {
  const value = Math.abs(Number(amount) || 0);
  const current = Number(customer.balance) || 0;
  const balanceAfter = type === "credit" ? current + value : Math.max(0, current - value);

  const record = await base44.entities.Transaction.create({
    customer_id: customer.id,
    customer_name: customer.name,
    type,
    amount: value,
    note: note || "",
    balance_after: balanceAfter,
    reference: `RC-${String(Date.now()).slice(-6)}`,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
  });

  await recalcCustomer(customer.id);
  return record;
}

export async function deleteTransaction(transaction) {
  await base44.entities.Transaction.delete(transaction.id);
  if (transaction.customer_id) await recalcCustomer(transaction.customer_id);
}

export async function uploadLogo(file) {
  const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
  return file_url;
}
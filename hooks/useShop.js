import { useCallback, useEffect, useMemo, useState } from "react";
import { buildSummary } from "@/lib/finance";
import { fetchCustomers, fetchTransactions } from "@/lib/shop";

export function useShop() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const [nextCustomers, nextTransactions] = await Promise.all([
        fetchCustomers(),
        fetchTransactions(),
      ]);
      setCustomers(nextCustomers);
      setTransactions(nextTransactions);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const summary = useMemo(
    () => buildSummary({ customers, transactions }),
    [customers, transactions]
  );

  return { customers, transactions, summary, loading, error, reload };
}
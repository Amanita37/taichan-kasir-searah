
import { useState } from "react";

export const useTransactionFilter = (transactions: any[] = []) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.customer_name && transaction.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      transaction.cashier_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    searchQuery,
    setSearchQuery,
    filteredTransactions,
  };
};


import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";

export const useTransactionItems = () => {
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [transactionItems, setTransactionItems] = useState<any[]>([]);
  const { getTransactionItems } = useTransactions();
  const { toast } = useToast();

  const fetchTransactionItems = async (transactionId: string) => {
    setIsLoadingItems(true);
    
    try {
      const items = await getTransactionItems(transactionId);
      setTransactionItems(items);
      return items;
    } catch (error) {
      console.error("Error fetching transaction items:", error);
      toast({
        title: "Gagal",
        description: "Tidak dapat mengambil detail transaksi",
        variant: "destructive",
        duration: 1000,
      });
      return [];
    } finally {
      setIsLoadingItems(false);
    }
  };

  return {
    transactionItems,
    isLoadingItems,
    fetchTransactionItems,
  };
};

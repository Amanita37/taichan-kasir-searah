
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionItem = Database["public"]["Tables"]["transaction_items"]["Row"];

interface CreateTransactionData {
  customerName?: string;
  items: {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  total: number;
  payment_amount: number;
  payment_method: string;
  cashier_name: string;
}

export function useTransactions() {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { mutate: createTransaction } = useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      // Generate transaction number with date and random part
      const date = new Date();
      const datePart = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('');
      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const transactionNumber = `TRX-${datePart}-${randomPart}`;
      
      // Insert transaction
      const { data: transaction, error } = await supabase
        .from("transactions")
        .insert({
          transaction_number: transactionNumber,
          customer_name: data.customerName || null,
          total: data.total,
          payment_amount: data.payment_amount,
          payment_method: data.payment_method,
          cashier_name: data.cashier_name,
        })
        .select()
        .single();

      if (error) throw error;
      if (!transaction) throw new Error("Failed to create transaction");
      
      // Insert transaction items
      const transactionItems = data.items.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
      }));
      
      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(transactionItems);
        
      if (itemsError) throw itemsError;
      
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const { mutate: deleteTransaction } = useMutation({
    mutationFn: async (id: string) => {
      // Delete transaction (transaction_items will cascade)
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const getTransactionItems = async (transactionId: string): Promise<TransactionItem[]> => {
    const { data, error } = await supabase
      .from("transaction_items")
      .select("*")
      .eq("transaction_id", transactionId);
      
    if (error) throw error;
    return data || [];
  };

  return {
    transactions,
    isLoadingTransactions,
    createTransaction,
    deleteTransaction,
    getTransactionItems,
  };
}

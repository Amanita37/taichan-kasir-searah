
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import { printReceipt } from "@/utils/receiptPrinter";
import { useTransactionItems } from "@/hooks/useTransactionItems";
import { useTransactionFilter } from "@/hooks/useTransactionFilter";

export const useReceipt = () => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any | null>(null);
  const [password, setPassword] = useState("");
  
  const { toast } = useToast();
  const { transactions, isLoadingTransactions, deleteTransaction } = useTransactions();
  const { settings } = useSettings();
  const { transactionItems, isLoadingItems, fetchTransactionItems } = useTransactionItems();
  const { searchQuery, setSearchQuery, filteredTransactions } = useTransactionFilter(transactions);

  const viewTransaction = async (transaction: any) => {
    setCurrentTransaction(transaction);
    const items = await fetchTransactionItems(transaction.id);
    setIsViewDialogOpen(true);
  };

  const confirmDelete = (transaction: any) => {
    setCurrentTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handlePasswordCheck = () => {
    const OWNER_PASSWORD = "admin123";
    
    if (password === OWNER_PASSWORD) {
      setIsPasswordDialogOpen(false);
      setIsDeleteDialogOpen(false);
      
      deleteTransaction(currentTransaction.id, {
        onSuccess: () => {
          toast({
            title: "Transaksi Dihapus",
            description: `Transaksi ${currentTransaction.transaction_number} telah dihapus.`,
            duration: 1000,
          });
        },
        onError: (error) => {
          console.error("Delete error:", error);
          toast({
            title: "Gagal Menghapus",
            description: "Terjadi kesalahan saat menghapus transaksi.",
            variant: "destructive",
            duration: 1000,
          });
        }
      });
      
      setPassword("");
    } else {
      toast({
        title: "Password Salah",
        description: "Password yang Anda masukkan salah.",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  const handleDeleteRequest = () => {
    setIsPasswordDialogOpen(true);
  };

  const handlePrint = () => {
    if (currentTransaction && transactionItems) {
      // Move the toast outside of the printReceipt function
      toast({
        title: "Cetak Struk",
        description: "Struk sedang dicetak.",
        duration: 1000,
      });
      
      // Call printReceipt without using hooks inside
      printReceipt({
        transaction: currentTransaction,
        transactionItems,
        settings,
      });
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isPasswordDialogOpen,
    setIsPasswordDialogOpen,
    currentTransaction,
    transactionItems,
    password,
    setPassword,
    isLoadingItems,
    isLoadingTransactions,
    filteredTransactions,
    settings,
    viewTransaction,
    confirmDelete,
    handlePasswordCheck,
    handleDeleteRequest,
    handlePrint,
  };
};

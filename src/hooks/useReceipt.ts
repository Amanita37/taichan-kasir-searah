import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import { printReceipt } from "@/utils/receipt";
import { useTransactionItems } from "@/hooks/useTransactionItems";
import { useTransactionFilter } from "@/hooks/useTransactionFilter";

export const useReceipt = () => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any | null>(null);
  const [password, setPassword] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  
  const { toast } = useToast();
  const { transactions, isLoadingTransactions, deleteTransaction } = useTransactions();
  const { settings } = useSettings();
  const { transactionItems, isLoadingItems, fetchTransactionItems } = useTransactionItems();
  const { searchQuery, setSearchQuery, filteredTransactions } = useTransactionFilter(transactions);

  // View a transaction and load its items
  const viewTransaction = async (transaction: any) => {
    setCurrentTransaction(transaction);
    await fetchTransactionItems(transaction.id);
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

  // Enhanced print function with loading state and error handling
  const handlePrint = () => {
    if (!currentTransaction || !transactionItems) {
      toast({
        title: "Gagal Mencetak",
        description: "Data transaksi tidak tersedia.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    
    try {
      setIsPrinting(true);
      
      // Get printer settings from user settings or use defaults
      const paperWidth = settings?.receipt_width ? `${settings.receipt_width}mm` : '48mm';
      // Use default value if receipt_scale isn't available in settings
      const printScale = settings?.receipt_scale || 90;
      
      // Notify that printing has started
      toast({
        title: "Cetak Struk",
        description: "Struk sedang disiapkan...",
        duration: 1000,
      });
      
      // Call printReceipt with device-specific optimizations
      const printSuccess = printReceipt({
        transaction: currentTransaction,
        transactionItems,
        settings,
        paperWidth,
        printScale,
        bypassPreview: true // Better for Android
      });
      
      if (!printSuccess) {
        toast({
          title: "Peringatan",
          description: "Pastikan popup tidak diblokir dan printer siap.",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Gagal Mencetak",
        description: "Terjadi kesalahan saat mencetak struk.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsPrinting(false);
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
    isPrinting,
    viewTransaction,
    confirmDelete,
    handlePasswordCheck,
    handleDeleteRequest,
    handlePrint,
  };
};

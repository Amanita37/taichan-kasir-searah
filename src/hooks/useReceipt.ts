
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, formatDate } from "@/lib/utils";

export const useReceipt = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any | null>(null);
  const [transactionItems, setTransactionItems] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  
  const { toast } = useToast();
  const { transactions, isLoadingTransactions, deleteTransaction, getTransactionItems } = useTransactions();
  const { settings } = useSettings();

  const filteredTransactions = transactions ? transactions.filter(
    (transaction) =>
      transaction.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.customer_name && transaction.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      transaction.cashier_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const viewTransaction = async (transaction: any) => {
    setCurrentTransaction(transaction);
    setIsLoadingItems(true);
    
    try {
      const items = await getTransactionItems(transaction.id);
      setTransactionItems(items);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Error fetching transaction items:", error);
      toast({
        title: "Gagal",
        description: "Tidak dapat mengambil detail transaksi",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsLoadingItems(false);
    }
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
    if (!receiptRef.current) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) {
      toast({
        title: "Gagal Mencetak",
        description: "Popup blocker mungkin mencegah pencetakan. Mohon izinkan pop-up untuk situs ini.",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    
    // Set receipt width based on settings
    const receiptWidth = settings?.receipt_width || 48;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Pembayaran</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              padding: 5mm;
              margin: 0;
              width: ${receiptWidth}mm;
            }
            .receipt {
              width: 100%;
              max-width: 100%;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .title {
              font-size: 14px;
              font-weight: bold;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
            }
            .item-detail {
              display: flex;
              flex-direction: column;
            }
            .total {
              font-weight: bold;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 10px;
              font-size: 10px;
            }
            @media print {
              body {
                width: ${receiptWidth}mm;
              }
              @page {
                margin: 0;
                size: ${receiptWidth}mm auto;
              }
            }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
          <script>
            setTimeout(function() {
              try {
                window.print();
                window.close();
              } catch(e) {
                console.error("Print error:", e);
                window.close();
              }
            }, 500);
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
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

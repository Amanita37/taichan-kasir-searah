
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
    try {
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
                font-weight: bold;
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
                  margin: 0;
                  padding: 0;
                  font-weight: bold;
                }
                @page {
                  margin: 0;
                  size: ${receiptWidth}mm auto;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <div class="title">${settings?.store_name || "Taichan Searah"}</div>
                <div class="text-sm">${settings?.store_address || "Jl. Contoh No. 123, Jakarta"}</div>
                <div class="text-sm">${settings?.store_phone || "(021) 123-4567"}</div>
              </div>
              
              <div class="divider"></div>
              
              <div class="text-sm">
                <div class="flex justify-between">
                  <span>No. Transaksi:</span>
                  <span>${currentTransaction?.transaction_number}</span>
                </div>
                <div class="flex justify-between">
                  <span>Tanggal:</span>
                  <span>${formatDate(currentTransaction?.created_at)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Kasir:</span>
                  <span>${currentTransaction?.cashier_name}</span>
                </div>
                ${currentTransaction?.customer_name ? `
                <div class="flex justify-between">
                  <span>Pelanggan:</span>
                  <span>${currentTransaction?.customer_name}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="divider"></div>
              
              <div class="items space-y-2">
                ${transactionItems.map((item) => `
                  <div class="flex justify-between">
                    <div>
                      <div>${item.product_name}</div>
                      <div class="text-sm">${formatCurrency(item.price)} x ${item.quantity}</div>
                    </div>
                    <div class="font-medium">
                      ${formatCurrency(item.total)}
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="divider"></div>
              
              <div class="totals space-y-1">
                <div class="flex justify-between">
                  <span>Total:</span>
                  <span class="font-bold">${formatCurrency(currentTransaction?.total)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Pembayaran (${currentTransaction?.payment_method}):</span>
                  <span>${formatCurrency(currentTransaction?.payment_amount)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Kembalian:</span>
                  <span>${formatCurrency(Number(currentTransaction?.payment_amount) - Number(currentTransaction?.total))}</span>
                </div>
              </div>
              
              <div class="divider"></div>
              
              <div class="footer text-center text-sm">
                <p>${settings?.receipt_footer || "Terima kasih atas kunjungan Anda!"}</p>
              </div>
            </div>
          </body>
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
        </html>
      `);
      
      printWindow.document.close();
      
      toast({
        title: "Cetak Struk",
        description: "Struk sedang dicetak.",
        duration: 1000,
      });
      
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Gagal Mencetak",
        description: "Terjadi kesalahan saat mencetak struk.",
        variant: "destructive",
        duration: 1000,
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

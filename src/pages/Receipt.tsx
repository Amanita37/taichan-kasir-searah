
import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Printer, 
  Eye, 
  Trash2,
  Receipt as ReceiptIcon 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import SupabaseInfoBox from "@/components/SupabaseInfoBox";

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const Receipt = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any | null>(null);
  const [transactionItems, setTransactionItems] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
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
    // Hard-coded owner password for demo
    const OWNER_PASSWORD = "admin123";
    
    if (password === OWNER_PASSWORD) {
      setIsPasswordDialogOpen(false);
      setIsDeleteDialogOpen(false);
      
      deleteTransaction(currentTransaction.id, {
        onSuccess: () => {
          toast({
            title: "Transaksi Dihapus",
            description: `Transaksi ${currentTransaction.transaction_number} telah dihapus.`,
          });
        },
        onError: (error) => {
          console.error("Delete error:", error);
          toast({
            title: "Gagal Menghapus",
            description: "Terjadi kesalahan saat menghapus transaksi.",
            variant: "destructive",
          });
        }
      });
      
      setPassword("");
    } else {
      toast({
        title: "Password Salah",
        description: "Password yang Anda masukkan salah.",
        variant: "destructive",
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

  if (isLoadingTransactions) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Memuat data transaksi...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!transactions) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Riwayat Transaksi</h1>
          <SupabaseInfoBox />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Riwayat Transaksi</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Cari nomor transaksi, pelanggan, atau kasir..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border shadow">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Metode Pembayaran</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.transaction_number}</TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell>{transaction.customer_name || "-"}</TableCell>
                      <TableCell>{transaction.cashier_name}</TableCell>
                      <TableCell>{formatCurrency(transaction.total)}</TableCell>
                      <TableCell>{transaction.payment_method}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => viewTransaction(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => confirmDelete(transaction)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      Tidak ada data transaksi yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* View Receipt Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          
          {isLoadingItems ? (
            <div className="py-8 text-center">
              <p>Memuat detail transaksi...</p>
            </div>
          ) : (
            <>
              <div className="py-4">
                <div className="receipt border rounded-md p-4" ref={receiptRef}>
                  <div className="header text-center">
                    <div className="title text-lg font-bold">{settings?.store_name || "Taichan Searah"}</div>
                    <div className="text-sm">{settings?.store_address || "Jl. Contoh No. 123, Jakarta"}</div>
                    <div className="text-sm">{settings?.store_phone || "(021) 123-4567"}</div>
                  </div>
                  
                  <div className="divider border-t border-dashed my-4"></div>
                  
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>No. Transaksi:</span>
                      <span>{currentTransaction?.transaction_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>{currentTransaction ? formatDate(currentTransaction.created_at) : ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kasir:</span>
                      <span>{currentTransaction?.cashier_name}</span>
                    </div>
                    {currentTransaction?.customer_name && (
                      <div className="flex justify-between">
                        <span>Pelanggan:</span>
                        <span>{currentTransaction.customer_name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="divider border-t border-dashed my-4"></div>
                  
                  <div className="items space-y-2">
                    {transactionItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <div>{item.product_name}</div>
                          <div className="text-sm">{formatCurrency(item.price)} x {item.quantity}</div>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="divider border-t border-dashed my-4"></div>
                  
                  <div className="totals space-y-1">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-bold">{formatCurrency(currentTransaction?.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pembayaran ({currentTransaction?.payment_method}):</span>
                      <span>{formatCurrency(currentTransaction?.payment_amount)}</span>
                    </div>
                    {currentTransaction && (
                      <div className="flex justify-between">
                        <span>Kembalian:</span>
                        <span>{formatCurrency(Number(currentTransaction.payment_amount) - Number(currentTransaction.total))}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="divider border-t border-dashed my-4"></div>
                  
                  <div className="footer text-center text-sm">
                    <p>{settings?.receipt_footer || "Terima kasih atas kunjungan Anda!"}</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4" />
                  Cetak Struk
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Transaksi</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus transaksi {currentTransaction?.transaction_number}? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center">
                  <ReceiptIcon className="h-12 w-12 text-red-500 mb-2" />
                </div>
                <p className="text-center text-sm mb-2">
                  Transaksi pada {currentTransaction ? formatDate(currentTransaction.created_at) : ""}
                </p>
                <p className="text-center font-semibold text-xl">
                  {formatCurrency(currentTransaction?.total)}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={handleDeleteRequest}
            >
              Hapus Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Password Verification Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verifikasi Password</DialogTitle>
            <DialogDescription>
              Masukkan password owner untuk menghapus transaksi ini.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button 
              onClick={handlePasswordCheck}
            >
              Verifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Receipt;

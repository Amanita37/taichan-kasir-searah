import { useState } from "react";
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
} from "@/components/ui/dialog";
import { Search, Calendar, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import ReceiptViewerDialog from "@/components/receipt/ReceiptViewerDialog";
import { useSettings } from "@/hooks/useSettings";
import { printReceipt } from "@/utils/receiptPrinter";

const DailySaleReport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any | null>(null);
  const [transactionItems, setTransactionItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  
  const { toast } = useToast();
  const { transactions, isLoadingTransactions, getTransactionItems } = useTransactions();
  const { settings } = useSettings();
  
  const itemsPerPage = 100;
  
  // Filter transactions based on date range and search query
  const filteredTransactions = transactions ? transactions.filter(
    (transaction) => {
      // Date filter
      const transactionDate = new Date(transaction.created_at);
      let dateMatch = true;
      if (dateRange?.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        dateMatch = dateMatch && transactionDate >= fromDate;
      }
      if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = dateMatch && transactionDate <= toDate;
      }
      
      // Search filter
      const searchMatch = 
        transaction.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.customer_name && transaction.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        transaction.cashier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.payment_method.toLowerCase().includes(searchQuery.toLowerCase());
        
      return dateMatch && searchMatch;
    }
  ) : [];
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Calculate report summary
  const reportSummary = {
    totalSales: filteredTransactions.reduce((sum, tx) => sum + Number(tx.total), 0),
    totalTransactions: filteredTransactions.length,
    cashPayments: filteredTransactions.filter(tx => tx.payment_method === 'Cash').reduce((sum, tx) => sum + Number(tx.total), 0),
    nonCashPayments: filteredTransactions.filter(tx => tx.payment_method !== 'Cash').reduce((sum, tx) => sum + Number(tx.total), 0)
  };
  
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

  const handlePrint = () => {
    if (currentTransaction && transactionItems) {
      // Show toast notification
      toast({
        title: "Cetak Struk",
        description: "Struk sedang dicetak.",
        duration: 1000,
      });
      
      // Use the shared print function
      printReceipt({
        transaction: currentTransaction,
        transactionItems,
        settings,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Laporan Penjualan Harian</h1>
        </div>

        {/* Report Summary Card */}
        <Card className="bg-primary/10 border-primary">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="font-semibold text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Ringkasan Laporan
                </h3>
                <p className="text-sm">
                  {dateRange?.from ? format(dateRange.from, 'dd MMM yyyy') : ''} 
                  {dateRange?.to ? ` - ${format(dateRange.to, 'dd MMM yyyy')}` : ''}
                </p>
              </div>
              <div className="mt-3 md:mt-0 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Transaksi:</p>
                  <p className="text-lg font-semibold">{reportSummary.totalTransactions}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Penjualan: </p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(reportSummary.totalSales)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Pembayaran Cash:</p>
                  <p>{formatCurrency(reportSummary.cashPayments)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Pembayaran Non-Cash:</p>
                  <p>{formatCurrency(reportSummary.nonCashPayments)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-auto">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Cari transaksi berdasarkan nomor, pelanggan, atau kasir..."
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
                  <TableHead>No Transaksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Metode Pembayaran</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTransactions ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      Memuat data transaksi...
                    </TableCell>
                  </TableRow>
                ) : paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.transaction_number}</TableCell>
                      <TableCell>{format(new Date(transaction.created_at), 'dd MMM yyyy HH:mm')}</TableCell>
                      <TableCell>{transaction.cashier_name}</TableCell>
                      <TableCell>{transaction.customer_name || "-"}</TableCell>
                      <TableCell>{formatCurrency(transaction.total)}</TableCell>
                      <TableCell>{transaction.payment_method}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 h-8"
                          onClick={() => viewTransaction(transaction)}
                        >
                          <FileText className="h-4 w-4" /> Detail
                        </Button>
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </Pagination>
        )}
      </div>

      {/* Receipt Viewer Dialog */}
      <ReceiptViewerDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        transaction={currentTransaction}
        transactionItems={transactionItems}
        isLoading={isLoadingItems}
        settings={settings}
        onPrint={handlePrint}
      />
    </DashboardLayout>
  );
};

export default DailySaleReport;

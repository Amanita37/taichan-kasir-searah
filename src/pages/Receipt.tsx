
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
import { Card, CardContent } from "@/components/ui/card";
import { Search, Printer, Eye } from "lucide-react";

// Demo data - in a real app, this would come from Supabase
const DEMO_TRANSACTIONS = [
  {
    id: "TRX-001",
    date: "2025-04-24T09:30:00",
    customer: "Pelanggan Umum",
    total: 150000,
    items: 5,
    paymentMethod: "Cash",
    cashier: "John Doe",
    items_detail: [
      { name: "Beras 5kg", price: 65000, quantity: 1 },
      { name: "Minyak Goreng 2L", price: 38000, quantity: 1 },
      { name: "Telur Ayam 1kg", price: 27000, quantity: 1 },
      { name: "Gula Pasir 1kg", price: 15000, quantity: 1 },
      { name: "Tepung Terigu 1kg", price: 5000, quantity: 1 },
    ],
  },
  {
    id: "TRX-002",
    date: "2025-04-24T10:15:00",
    customer: "Lisa Amanda",
    total: 87500,
    items: 3,
    paymentMethod: "Cash",
    cashier: "Jane Smith",
    items_detail: [
      { name: "Ayam Potong 1kg", price: 32000, quantity: 1 },
      { name: "Coca Cola 1.5L", price: 16000, quantity: 2 },
      { name: "Roti Tawar", price: 15000, quantity: 1 },
      { name: "Mie Instan", price: 3500, quantity: 2 },
    ],
  },
  {
    id: "TRX-003",
    date: "2025-04-24T11:45:00",
    customer: "Budi Santoso",
    total: 125000,
    items: 4,
    paymentMethod: "Cash",
    cashier: "John Doe",
    items_detail: [
      { name: "Beras 5kg", price: 65000, quantity: 1 },
      { name: "Gula Pasir 1kg", price: 15000, quantity: 2 },
      { name: "Minyak Goreng 2L", price: 38000, quantity: 1 },
    ],
  },
];

// Format date to locale string
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const Receipt = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<typeof DEMO_TRANSACTIONS[0] | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  const filteredTransactions = DEMO_TRANSACTIONS.filter(
    (transaction) =>
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(transaction.date).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrintReceipt = () => {
    if (!selectedTransaction) return;
    
    // In a real application, this would trigger the actual printing functionality
    // For now, we'll just log to console
    console.log("Printing receipt for:", selectedTransaction.id);
    
    // Normally, you would use window.print() or a dedicated receipt printing library
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Manajemen Struk Belanja</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Cari transaksi berdasarkan ID, pelanggan, atau tanggal..."
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
                  <TableHead>ID Transaksi</TableHead>
                  <TableHead>Tanggal & Waktu</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Jumlah Item</TableHead>
                  <TableHead>Metode Pembayaran</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>{formatCurrency(transaction.total)}</TableCell>
                      <TableCell>{transaction.items}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>{transaction.cashier}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setIsReceiptDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      Tidak ada data transaksi yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Struk</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="py-4">
              <div className="receipt-container bg-white p-6 rounded-md border">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">Taichan Searah</h2>
                  <p className="text-sm">Sistem Manajemen Kasir Indonesia</p>
                  <p className="text-xs text-gray-500">Jl. Contoh No. 123, Jakarta</p>
                  <p className="text-xs text-gray-500">Telp: (021) 123-4567</p>
                </div>
                
                <div className="border-t border-b border-dashed py-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>No. Transaksi:</span>
                    <span className="font-medium">{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tanggal:</span>
                    <span>{formatDate(selectedTransaction.date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kasir:</span>
                    <span>{selectedTransaction.cashier}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pelanggan:</span>
                    <span>{selectedTransaction.customer}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left pb-1">Item</th>
                        <th className="text-right pb-1">Qty</th>
                        <th className="text-right pb-1">Harga</th>
                        <th className="text-right pb-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransaction.items_detail.map((item, index) => (
                        <tr key={index} className="border-b border-dotted">
                          <td className="py-1">{item.name}</td>
                          <td className="text-right py-1">{item.quantity}</td>
                          <td className="text-right py-1">{formatCurrency(item.price)}</td>
                          <td className="text-right py-1">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedTransaction.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Metode Pembayaran:</span>
                    <span>{selectedTransaction.paymentMethod}</span>
                  </div>
                </div>
                
                <div className="text-center text-sm mt-4">
                  <p>Terima kasih atas kunjungan Anda!</p>
                  <p className="text-xs text-gray-500">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button 
                  className="flex items-center gap-2 pos-btn"
                  onClick={handlePrintReceipt}
                >
                  <Printer className="h-4 w-4" />
                  Cetak Struk
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Receipt;

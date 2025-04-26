
import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import TransactionsTable from "@/components/receipt/TransactionsTable";
import ReceiptViewerDialog from "@/components/receipt/ReceiptViewerDialog";
import { useReceipt } from "@/hooks/useReceipt";
import ErrorBoundary from "@/components/ErrorBoundary";

const Receipt = () => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const {
    searchQuery,
    setSearchQuery,
    isViewDialogOpen,
    setIsViewDialogOpen,
    currentTransaction,
    transactionItems,
    isLoadingItems,
    isLoadingTransactions,
    filteredTransactions,
    settings,
    viewTransaction,
    confirmDelete,
    handlePrint,
  } = useReceipt();

  if (isLoadingTransactions) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Memuat data transaksi...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
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

          <TransactionsTable 
            transactions={filteredTransactions}
            onViewTransaction={viewTransaction}
            onDeleteTransaction={confirmDelete}
          />
        </div>

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
    </ErrorBoundary>
  );
};

export default Receipt;

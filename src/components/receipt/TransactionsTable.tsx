
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TransactionsTableProps {
  transactions: any[];
  onViewTransaction: (transaction: any) => void;
  onDeleteTransaction: (transaction: any) => void;
}

const TransactionsTable = ({
  transactions,
  onViewTransaction,
  onDeleteTransaction,
}: TransactionsTableProps) => {
  return (
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
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
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
                        onClick={() => onViewTransaction(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => onDeleteTransaction(transaction)}
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
  );
};

export default TransactionsTable;

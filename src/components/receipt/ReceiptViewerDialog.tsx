
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ReceiptViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
  transactionItems: any[];
  isLoading: boolean;
  settings: any;
  onPrint: () => void;
}

const ReceiptContent = forwardRef<HTMLDivElement, { transaction: any; transactionItems: any[]; settings: any }>(
  ({ transaction, transactionItems, settings }, ref) => {
    if (!transaction) return null;

    return (
      <div className="receipt border rounded-md p-4" ref={ref}>
        <div className="header text-center">
          <div className="title text-lg font-bold">{settings?.store_name || "Taichan Searah"}</div>
          <div className="text-sm">{settings?.store_address || "Jl. Contoh No. 123, Jakarta"}</div>
          <div className="text-sm">{settings?.store_phone || "(021) 123-4567"}</div>
        </div>
        
        <div className="divider border-t border-dashed my-4"></div>
        
        <div className="text-sm">
          <div className="flex justify-between">
            <span>No. Transaksi:</span>
            <span>{transaction.transaction_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{formatDate(transaction.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>{transaction.cashier_name}</span>
          </div>
          {transaction.customer_name && (
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span>{transaction.customer_name}</span>
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
            <span className="font-bold">{formatCurrency(transaction.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pembayaran ({transaction.payment_method}):</span>
            <span>{formatCurrency(transaction.payment_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembalian:</span>
            <span>{formatCurrency(Number(transaction.payment_amount) - Number(transaction.total))}</span>
          </div>
        </div>
        
        <div className="divider border-t border-dashed my-4"></div>
        
        <div className="footer text-center text-sm">
          <p>{settings?.receipt_footer || "Terima kasih atas kunjungan Anda!"}</p>
        </div>
      </div>
    );
  }
);

ReceiptContent.displayName = "ReceiptContent";

const ReceiptViewerDialog = ({
  open,
  onOpenChange,
  transaction,
  transactionItems,
  isLoading,
  settings,
  onPrint,
}: ReceiptViewerDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <p>Memuat detail transaksi...</p>
          </div>
        ) : (
          <>
            <div className="py-4">
              <ReceiptContent
                ref={receiptRef}
                transaction={transaction}
                transactionItems={transactionItems}
                settings={settings}
              />
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={onPrint}
              >
                <Printer className="h-4 w-4" />
                Cetak Struk
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewerDialog;


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type PaymentDialogProps } from "@/types/pos";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const PaymentDialog = ({
  open,
  onOpenChange,
  cart,
  customerName,
  cashAmount,
  total,
  onConfirm,
  paymentMethod = "Cash",
  onPaymentMethodChange,
}: PaymentDialogProps) => {
  const calculateChange = () => {
    if (typeof cashAmount !== "number" || cashAmount < total) {
      return 0;
    }
    return cashAmount - total;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
          <DialogDescription>
            Silakan periksa informasi pembayaran di bawah ini dengan benar sebelum menyelesaikan transaksi.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {customerName && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pelanggan:</span>
              <span>{customerName}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="font-medium">Daftar Produk:</h3>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Metode Pembayaran:</h3>
            <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Debit">Kartu Debit</SelectItem>
                <SelectItem value="Credit">Kartu Kredit</SelectItem>
                <SelectItem value="QRIS">QRIS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Dibayar:</span>
              <span>{typeof cashAmount === "number" ? formatCurrency(cashAmount) : "0"}</span>
            </div>
            {typeof cashAmount === "number" && cashAmount >= total && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Kembalian:</span>
                <span>{formatCurrency(calculateChange())}</span>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button 
            className="bg-primary hover:bg-primary-dark text-secondary-foreground"
            onClick={onConfirm}
            disabled={typeof cashAmount !== "number" || cashAmount < total}
          >
            Konfirmasi Pembayaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

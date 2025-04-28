
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Receipt } from "lucide-react";
import CartItem from "./CartItem";
import { type CartProps } from "@/types/pos";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const Cart = ({
  cart,
  customerName,
  cashAmount,
  onCustomerNameChange,
  onCashAmountChange,
  onQuantityChange,
  onUpdateQuantity,
  onRemoveFromCart,
  onPrintReceipt,
  onCheckout,
  calculateTotal,
}: CartProps) => {
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const total = calculateTotal();
  const calculateChange = () => {
    if (typeof cashAmount !== "number" || cashAmount < total) {
      return 0;
    }
    return cashAmount - total;
  };

  return (
    <div className="mt-6 md:mt-0 md:w-96 h-full flex flex-col">
      <div className="bg-white rounded-t-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Keranjang Belanja</h2>
        <Input
          placeholder="Nama Pelanggan (Opsional)"
          className="mb-3"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-white border-x p-4">
        {cart.length > 0 ? (
          <div className="space-y-3">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                {...item}
                onQuantityChange={onQuantityChange}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveFromCart}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center">
            <p className="text-gray-500">Keranjang kosong</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-b-lg border p-4 space-y-3">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm">Metode Pembayaran:</label>
          <Select defaultValue="Cash" onValueChange={setPaymentMethod}>
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
        
        <div className="space-y-2">
          <label className="text-sm">Jumlah Dibayar:</label>
          <Input
            type="number"
            placeholder="0"
            value={cashAmount}
            onChange={(e) => onCashAmountChange(e.target.value)}
          />
        </div>
        {typeof cashAmount === "number" && cashAmount >= total && (
          <div className="flex justify-between text-green-600 font-semibold">
            <span>Kembalian:</span>
            <span>{formatCurrency(calculateChange())}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => onPrintReceipt()}
          >
            <Receipt className="h-4 w-4" />
            Print Struk
          </Button>
          <Button
            className="w-full bg-primary hover:bg-primary-dark text-secondary-foreground"
            onClick={() => onCheckout()}
          >
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;

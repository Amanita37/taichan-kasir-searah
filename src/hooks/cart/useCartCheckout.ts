
import { useToast } from "@/components/ui/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { type CartItem } from "@/types/pos";

export interface UseCartCheckoutProps {
  cart: CartItem[];
  customerName: string;
  cashAmount: number | "";
  calculateTotal: () => number;
  clearCart: () => void;
}

export const useCartCheckout = ({
  cart,
  customerName,
  cashAmount,
  calculateTotal,
  clearCart
}: UseCartCheckoutProps) => {
  const { toast } = useToast();
  const { createTransaction } = useTransactions();

  const handleCheckout = async (paymentMethod = "Cash", cashierName = "Admin") => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Silakan tambahkan produk ke keranjang terlebih dahulu.",
        variant: "destructive",
        duration: 1000,
      });
      return false;
    }
    
    if (typeof cashAmount !== "number" || cashAmount < calculateTotal()) {
      toast({
        title: "Pembayaran Tidak Mencukupi",
        description: "Jumlah uang yang dibayarkan kurang dari total belanja.",
        variant: "destructive",
        duration: 1000,
      });
      return false;
    }

    try {
      // Prepare transaction data
      const transactionData = {
        customerName: customerName || undefined,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        total: calculateTotal(),
        payment_amount: Number(cashAmount),
        payment_method: paymentMethod,
        cashier_name: cashierName
      };

      // Create transaction
      await createTransaction(transactionData);

      toast({
        title: "Transaksi Berhasil",
        description: `Total: ${new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(calculateTotal())}. Kembalian: ${new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(
          Number(cashAmount) - calculateTotal()
        )}`,
        duration: 1000,
      });
      
      return true;
    } catch (error) {
      console.error("Transaction error:", error);
      toast({
        title: "Transaksi Gagal",
        description: "Terjadi kesalahan saat menyimpan transaksi.",
        variant: "destructive",
        duration: 1000,
      });
      return false;
    }
  };

  return {
    handleCheckout
  };
};

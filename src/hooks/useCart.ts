
import { useState } from "react";
import { type CartItem, type Product } from "@/types/pos";
import { useToast } from "@/components/ui/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { supabase } from "@/integrations/supabase/client";

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const { toast } = useToast();
  const { createTransaction } = useTransactions();

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const itemExists = currentCart.find((item) => item.id === product.id);
      if (itemExists) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity >= 0) {
      setCart((currentCart) =>
        currentCart
          .map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
          .filter((item) => item.quantity > 0)
      );
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setCashAmount("");
  };

  const handleCheckout = async (cashierName: string = "Admin") => {
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
        payment_method: "Cash",
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

  const handlePrintReceipt = (transactionItems = cart, total = calculateTotal(), customerName = "") => {
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
      
      // Get receipt settings
      const receiptWidth = 48; // Default width
      const storeName = "Taichan Searah"; // Default store name
      const storeAddress = "Jl. Contoh No. 123, Jakarta"; // Default store address
      const storePhone = "(021) 123-4567"; // Default phone
      const receiptFooter = "Terima kasih atas kunjungan Anda!"; // Default footer
      
      const formatCurrencyPrint = (amount: number): string => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency", 
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount);
      };
      
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
            <div class="receipt">
              <div class="header">
                <div class="title">${storeName}</div>
                <div class="text-sm">${storeAddress}</div>
                <div class="text-sm">${storePhone}</div>
              </div>
              
              <div class="divider"></div>
              
              <div class="text-sm">
                <div class="flex justify-between">
                  <span>Tanggal:</span>
                  <span>${new Date().toLocaleDateString('id-ID', {
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                ${customerName ? `
                <div class="flex justify-between">
                  <span>Pelanggan:</span>
                  <span>${customerName}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="divider"></div>
              
              <div class="items space-y-2">
                ${transactionItems.map((item) => `
                  <div class="flex justify-between">
                    <div>
                      <div>${item.name}</div>
                      <div class="text-sm">${formatCurrencyPrint(item.price)} x ${item.quantity}</div>
                    </div>
                    <div class="font-medium">
                      ${formatCurrencyPrint(item.price * item.quantity)}
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="divider"></div>
              
              <div class="totals space-y-1">
                <div class="flex justify-between">
                  <span>Total:</span>
                  <span class="font-bold">${formatCurrencyPrint(total)}</span>
                </div>
                ${typeof cashAmount === "number" ? `
                <div class="flex justify-between">
                  <span>Pembayaran (Cash):</span>
                  <span>${formatCurrencyPrint(cashAmount)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Kembalian:</span>
                  <span>${formatCurrencyPrint(Number(cashAmount) - total)}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="divider"></div>
              
              <div class="footer text-center text-sm">
                <p>${receiptFooter}</p>
              </div>
            </div>
            
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
    cart,
    customerName,
    cashAmount,
    setCustomerName,
    setCashAmount,
    addToCart,
    handleQuantityChange,
    updateQuantity,
    removeFromCart,
    calculateTotal,
    clearCart,
    handleCheckout,
    handlePrintReceipt,
  };
};

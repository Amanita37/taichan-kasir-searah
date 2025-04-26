
import { useState } from "react";
import { type CartItem, type Product } from "@/types/pos";
import { useToast } from "@/components/ui/use-toast";

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const { toast } = useToast();

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

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Silakan tambahkan produk ke keranjang terlebih dahulu.",
        variant: "destructive",
      });
      return false;
    }
    if (typeof cashAmount !== "number" || cashAmount < calculateTotal()) {
      toast({
        title: "Pembayaran Tidak Mencukupi",
        description: "Jumlah uang yang dibayarkan kurang dari total belanja.",
        variant: "destructive",
      });
      return false;
    }
    return true;
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
  };
};

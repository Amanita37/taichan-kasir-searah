
import { useCartState } from "./useCartState";
import { useCartCheckout } from "./useCartCheckout";
import { useCartPrint } from "./useCartPrint";
import { supabase } from "@/integrations/supabase/client";

export const useCart = () => {
  const {
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
  } = useCartState();

  const { handleCheckout } = useCartCheckout({
    cart,
    customerName,
    cashAmount,
    calculateTotal,
    clearCart,
  });

  const { handlePrintReceipt } = useCartPrint({
    calculateTotal,
    cashAmount,
  });

  return {
    // State
    cart,
    customerName,
    cashAmount,
    setCustomerName,
    setCashAmount,
    
    // Cart operations
    addToCart,
    handleQuantityChange,
    updateQuantity,
    removeFromCart,
    calculateTotal,
    clearCart,
    
    // Checkout
    handleCheckout,
    
    // Print
    handlePrintReceipt: (items = cart, customName = customerName) => 
      handlePrintReceipt(items, customName),
  };
};


import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";
import PaymentDialog from "@/components/pos/PaymentDialog";
import ProductSearch from "@/components/pos/ProductSearch";
import { useCart } from "@/hooks/useCart";
import { type Product } from "@/types/pos";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useProducts } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = ["Semua", "Bahan Pokok", "Paket", "Minuman", "Makanan"];

const POS = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const { toast } = useToast();
  const { products, isLoadingProducts } = useProducts();
  const navigate = useNavigate();
  
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
    handleCheckout,
    handlePrintReceipt,
  } = useCart();

  useEffect(() => {
    const channel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Product change received:', payload);
          // No need to handle directly as useProducts will refresh
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProducts = products ? products
    .filter((product) => 
      (category === "Semua" || product.category === category) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image_url || '/placeholder.svg',
      stock: product.stock,
      barcode: product.barcode || ''
    })) : [];

  const handleConfirmPayment = async () => {
    if (await handleCheckout(paymentMethod)) {
      clearCart();
      setIsPaymentDialogOpen(false);
      
      toast({
        title: "Mengarahkan ke halaman struk",
        description: "Anda akan diarahkan ke halaman struk.",
        duration: 1000,
      });
      
      setTimeout(() => {
        navigate('/receipt');
      }, 1500);
    }
  };

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-10rem)] md:flex-row md:gap-6">
          <div className="flex-1 overflow-hidden flex flex-col">
            <ProductSearch
              searchQuery={searchQuery}
              category={category}
              onSearchChange={setSearchQuery}
              onCategoryChange={setCategory}
              categories={CATEGORIES}
            />

            <div className="flex-1 overflow-y-auto pb-4">
              {isLoadingProducts ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">Memuat produk...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <ProductGrid 
                  products={filteredProducts}
                  onProductClick={addToCart}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">Tidak ada produk yang ditemukan</p>
                </div>
              )}
            </div>
          </div>

          <Cart
            cart={cart}
            customerName={customerName}
            cashAmount={cashAmount}
            onCustomerNameChange={setCustomerName}
            onCashAmountChange={(value) => {
              const numValue = value === "" ? "" : parseFloat(value);
              setCashAmount(numValue);
            }}
            onQuantityChange={handleQuantityChange}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onPrintReceipt={handlePrintReceipt}
            onCheckout={() => setIsPaymentDialogOpen(true)}
            calculateTotal={calculateTotal}
          />
        </div>

        <PaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          cart={cart}
          customerName={customerName}
          cashAmount={cashAmount}
          total={calculateTotal()}
          onConfirm={handleConfirmPayment}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
        />
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default POS;

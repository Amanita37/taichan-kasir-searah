import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";
import PaymentDialog from "@/components/pos/PaymentDialog";
import ProductSearch from "@/components/pos/ProductSearch";
import { useCart } from "@/hooks/useCart";
import { type Product } from "@/types/pos";
import ErrorBoundary from "@/components/ErrorBoundary";

const DEMO_PRODUCTS: Product[] = [
  { id: "1", name: "Beras 5kg", price: 65000, category: "Bahan Pokok", image: "/placeholder.svg", stock: 100, barcode: "8998989300019" },
  { id: "2", name: "Minyak Goreng 2L", price: 38000, category: "Bahan Pokok", image: "/placeholder.svg", stock: 75, barcode: "8998989300026" },
  { id: "3", name: "Gula Pasir 1kg", price: 15000, category: "Bahan Pokok", image: "/placeholder.svg", stock: 120, barcode: "8998989300033" },
  { id: "4", name: "Tepung Terigu 1kg", price: 12000, category: "Bahan Pokok", image: "/placeholder.svg", stock: 85, barcode: "8998989300040" },
  { id: "5", name: "Telur Ayam 1kg", price: 27000, category: "Segar", image: "/placeholder.svg", stock: 60, barcode: "8998989300057" },
  { id: "6", name: "Ayam Potong 1kg", price: 32000, category: "Segar", image: "/placeholder.svg", stock: 45, barcode: "8998989300064" },
  { id: "7", name: "Coca Cola 1.5L", price: 16000, category: "Minuman", image: "/placeholder.svg", stock: 90, barcode: "8998989300071" },
  { id: "8", name: "Aqua 1.5L", price: 7000, category: "Minuman", image: "/placeholder.svg", stock: 150, barcode: "8998989300088" },
  { id: "9", name: "Mie Instan", price: 3500, category: "Makanan", image: "/placeholder.svg", stock: 200, barcode: "8998989300095" },
  { id: "10", name: "Roti Tawar", price: 15000, category: "Makanan", image: "/placeholder.svg", stock: 70, barcode: "8998989300101" },
];

const CATEGORIES = ["Semua", "Bahan Pokok", "Segar", "Minuman", "Makanan"];

const POS = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();
  
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
  } = useCart();

  const filteredProducts = DEMO_PRODUCTS.filter(
    (product) =>
      (category === "Semua" || product.category === category) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrintReceipt = () => {
    toast({
      title: "Print Struk",
      description: "Fitur cetak struk sedang diimplementasikan.",
    });
  };

  const handleConfirmPayment = () => {
    if (handleCheckout()) {
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
      });

      clearCart();
      setIsPaymentDialogOpen(false);
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
              {filteredProducts.length > 0 ? (
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
        />
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default POS;

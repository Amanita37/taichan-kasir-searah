
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";
import PaymentDialog from "@/components/pos/PaymentDialog";
import { type Product, type CartItem } from "@/types/pos";
import ErrorBoundary from "@/components/ErrorBoundary";

// Temporary product data modified to match Product type
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredProducts = DEMO_PRODUCTS.filter(
    (product) =>
      (category === "Semua" || product.category === category) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handlePrintReceipt = () => {
    toast({
      title: "Print Struk",
      description: "Fitur cetak struk sedang diimplementasikan.",
    });
  };

  const openPaymentDialog = () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Silakan tambahkan produk ke keranjang terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  const handleCheckout = () => {
    if (typeof cashAmount !== "number" || cashAmount < calculateTotal()) {
      toast({
        title: "Pembayaran Tidak Mencukupi",
        description: "Jumlah uang yang dibayarkan kurang dari total belanja.",
        variant: "destructive",
      });
      return;
    }

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
        cashAmount - calculateTotal()
      )}`,
    });

    setCart([]);
    setCustomerName("");
    setCashAmount("");
    setIsPaymentDialogOpen(false);
  };

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-10rem)] md:flex-row md:gap-6">
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Cari produk..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="Semua" className="mb-4">
              <TabsList className="w-full overflow-x-auto flex flex-nowrap justify-start">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    onClick={() => setCategory(cat)}
                    className="whitespace-nowrap"
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

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
            onCheckout={openPaymentDialog}
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
          onConfirm={handleCheckout}
        />
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default POS;

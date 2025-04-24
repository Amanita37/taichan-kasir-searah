
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Minus, Trash2, Receipt } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Temporary product data (would come from Supabase)
const DEMO_PRODUCTS = [
  { id: 1, name: "Beras 5kg", price: 65000, category: "Bahan Pokok", image: "/placeholder.svg" },
  { id: 2, name: "Minyak Goreng 2L", price: 38000, category: "Bahan Pokok", image: "/placeholder.svg" },
  { id: 3, name: "Gula Pasir 1kg", price: 15000, category: "Bahan Pokok", image: "/placeholder.svg" },
  { id: 4, name: "Tepung Terigu 1kg", price: 12000, category: "Bahan Pokok", image: "/placeholder.svg" },
  { id: 5, name: "Telur Ayam 1kg", price: 27000, category: "Segar", image: "/placeholder.svg" },
  { id: 6, name: "Ayam Potong 1kg", price: 32000, category: "Segar", image: "/placeholder.svg" },
  { id: 7, name: "Coca Cola 1.5L", price: 16000, category: "Minuman", image: "/placeholder.svg" },
  { id: 8, name: "Aqua 1.5L", price: 7000, category: "Minuman", image: "/placeholder.svg" },
  { id: 9, name: "Mie Instan", price: 3500, category: "Makanan", image: "/placeholder.svg" },
  { id: 10, name: "Roti Tawar", price: 15000, category: "Makanan", image: "/placeholder.svg" },
];

const CATEGORIES = ["Semua", "Bahan Pokok", "Segar", "Minuman", "Makanan"];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const POS = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const { toast } = useToast();

  const filteredProducts = DEMO_PRODUCTS.filter(
    (product) =>
      (category === "Semua" || product.category === category) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: typeof DEMO_PRODUCTS[0]) => {
    setCart((currentCart) => {
      const itemExists = currentCart.find((item) => item.id === product.id);
      if (itemExists) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, change: number) => {
    setCart((currentCart) => {
      return currentCart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = Math.max(0, item.quantity + change);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateChange = () => {
    const total = calculateTotal();
    if (typeof cashAmount !== "number" || cashAmount < total) {
      return 0;
    }
    return cashAmount - total;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Silakan tambahkan produk ke keranjang terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    if (typeof cashAmount !== "number" || cashAmount < calculateTotal()) {
      toast({
        title: "Pembayaran Tidak Mencukupi",
        description: "Jumlah uang yang dibayarkan kurang dari total belanja.",
        variant: "destructive",
      });
      return;
    }

    // Process transaction (would connect to Supabase in production)
    toast({
      title: "Transaksi Berhasil",
      description: `Total: ${formatCurrency(calculateTotal())}. Kembalian: ${formatCurrency(calculateChange())}`,
    });

    // Clear cart after successful transaction
    setCart([]);
    setCustomerName("");
    setCashAmount("");
  };

  const renderProductGrid = () => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => addToCart(product)}
        >
          <CardContent className="p-3">
            <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 mb-2">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <h3 className="text-sm font-medium">{product.name}</h3>
            <p className="text-sm font-semibold text-primary-dark">
              {formatCurrency(product.price)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-10rem)] md:flex-row md:gap-6">
        {/* Products section */}
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

          {/* Categories */}
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
              renderProductGrid()
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">Tidak ada produk yang ditemukan</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart section */}
        <div className="mt-6 md:mt-0 md:w-96 h-full flex flex-col">
          <div className="bg-white rounded-t-lg border p-4">
            <h2 className="text-lg font-semibold mb-3">Keranjang Belanja</h2>
            <Input
              placeholder="Nama Pelanggan (Opsional)"
              className="mb-3"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto bg-white border-x p-4">
            {cart.length > 0 ? (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center">
                <p className="text-gray-500">Keranjang kosong</p>
              </div>
            )}
          </div>

          {/* Payment section */}
          <div className="bg-white rounded-b-lg border p-4 space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Jumlah Dibayar:</label>
              <Input
                type="number"
                placeholder="0"
                value={cashAmount}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                  setCashAmount(value);
                }}
              />
            </div>
            {typeof cashAmount === "number" && cashAmount >= calculateTotal() && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Kembalian:</span>
                <span>{formatCurrency(calculateChange())}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Receipt className="h-4 w-4" />
                Print Struk
              </Button>
              <Button
                className="w-full bg-primary hover:bg-primary-dark text-secondary-foreground"
                onClick={handleCheckout}
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default POS;

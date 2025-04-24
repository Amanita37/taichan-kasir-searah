
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileDown,
  FileUp,
  Package,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Temporary inventory data (would come from Supabase)
const DEMO_INVENTORY = [
  { 
    id: 1,
    name: "Beras 5kg",
    sku: "BP001",
    category: "Bahan Pokok",
    price: 65000,
    cost: 58000,
    stock: 25,
    unit: "pack"
  },
  { 
    id: 2,
    name: "Minyak Goreng 2L",
    sku: "BP002",
    category: "Bahan Pokok",
    price: 38000,
    cost: 34000,
    stock: 30,
    unit: "botol"
  },
  { 
    id: 3,
    name: "Gula Pasir 1kg",
    sku: "BP003",
    category: "Bahan Pokok",
    price: 15000,
    cost: 13500,
    stock: 40,
    unit: "pack"
  },
  { 
    id: 4,
    name: "Tepung Terigu 1kg",
    sku: "BP004",
    category: "Bahan Pokok",
    price: 12000,
    cost: 10500,
    stock: 35,
    unit: "pack"
  },
  { 
    id: 5,
    name: "Telur Ayam 1kg",
    sku: "FH001",
    category: "Segar",
    price: 27000,
    cost: 24000,
    stock: 20,
    unit: "tray"
  },
  { 
    id: 6,
    name: "Ayam Potong 1kg",
    sku: "FH002",
    category: "Segar",
    price: 32000,
    cost: 28000,
    stock: 15,
    unit: "pack"
  },
  { 
    id: 7,
    name: "Coca Cola 1.5L",
    sku: "BV001",
    category: "Minuman",
    price: 16000,
    cost: 13000,
    stock: 45,
    unit: "botol"
  },
  { 
    id: 8,
    name: "Aqua 1.5L",
    sku: "BV002",
    category: "Minuman",
    price: 7000,
    cost: 5500,
    stock: 60,
    unit: "botol"
  },
];

const CATEGORIES = ["Bahan Pokok", "Segar", "Minuman", "Makanan", "Lainnya"];
const UNITS = ["pack", "botol", "tray", "karton", "kg", "pcs"];

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  price: string;
  cost: string;
  stock: string;
  unit: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const Inventory = () => {
  const [inventory, setInventory] = useState(DEMO_INVENTORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<typeof DEMO_INVENTORY[0] | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    unit: ""
  });

  const [stockAdjustment, setStockAdjustment] = useState({
    type: "add",
    quantity: ""
  });

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      category: "",
      price: "",
      cost: "",
      stock: "",
      unit: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProduct = () => {
    // Simple validation
    if (!formData.name || !formData.sku || !formData.category || !formData.price || !formData.cost || !formData.stock || !formData.unit) {
      toast({
        title: "Validasi Gagal",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Add new product (would connect to Supabase in production)
    const newProduct = {
      id: inventory.length + 1,
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock: parseFloat(formData.stock),
      unit: formData.unit,
    };

    setInventory((prev) => [...prev, newProduct]);
    setIsAddDialogOpen(false);
    resetForm();
    
    toast({
      title: "Produk Ditambahkan",
      description: `${formData.name} berhasil ditambahkan ke inventaris.`,
    });
  };

  const handleEditProduct = () => {
    if (!currentProduct) return;

    // Simple validation
    if (!formData.name || !formData.sku || !formData.category || !formData.price || !formData.cost || !formData.unit) {
      toast({
        title: "Validasi Gagal",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Update product (would connect to Supabase in production)
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === currentProduct.id) {
          return {
            ...item,
            name: formData.name,
            sku: formData.sku,
            category: formData.category,
            price: parseFloat(formData.price),
            cost: parseFloat(formData.cost),
            unit: formData.unit,
          };
        }
        return item;
      })
    );

    setIsEditDialogOpen(false);
    resetForm();
    
    toast({
      title: "Produk Diperbarui",
      description: `${formData.name} berhasil diperbarui.`,
    });
  };

  const handleDeleteProduct = (id: number) => {
    // Delete product (would connect to Supabase in production)
    const productToDelete = inventory.find((item) => item.id === id);
    
    if (!productToDelete) return;
    
    setInventory((prev) => prev.filter((item) => item.id !== id));
    
    toast({
      title: "Produk Dihapus",
      description: `${productToDelete.name} berhasil dihapus dari inventaris.`,
    });
  };

  const handleStockAdjustment = () => {
    if (!currentProduct || stockAdjustment.quantity === "") return;

    const quantity = parseFloat(stockAdjustment.quantity);
    
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Validasi Gagal",
        description: "Jumlah harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    // Update stock (would connect to Supabase in production)
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === currentProduct.id) {
          const newStock = stockAdjustment.type === "add" 
            ? item.stock + quantity 
            : Math.max(0, item.stock - quantity);
            
          return { ...item, stock: newStock };
        }
        return item;
      })
    );

    setIsStockDialogOpen(false);
    setStockAdjustment({ type: "add", quantity: "" });
    
    toast({
      title: "Stok Diperbarui",
      description: `Stok ${currentProduct.name} berhasil diperbarui.`,
    });
  };

  const openEditDialog = (product: typeof DEMO_INVENTORY[0]) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      unit: product.unit,
    });
    setIsEditDialogOpen(true);
  };

  const openStockDialog = (product: typeof DEMO_INVENTORY[0]) => {
    setCurrentProduct(product);
    setStockAdjustment({ type: "add", quantity: "" });
    setIsStockDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Manajemen Inventaris</h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button 
              className="pos-btn flex items-center gap-2"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileUp className="h-4 w-4" />
              Import
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Cari produk, SKU, atau kategori..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border shadow">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.sku}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{formatCurrency(product.cost)}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            product.stock <= 5
                              ? "bg-red-100 text-red-800"
                              : product.stock <= 15
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openStockDialog(product)}
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      Tidak ada data produk yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Produk Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama produk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Masukkan kode produk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Harga Beli</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Harga Jual</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stok Awal</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Satuan</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleSelectChange("unit", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary-dark text-secondary-foreground">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Produk</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama produk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sku">SKU</Label>
              <Input
                id="edit-sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Masukkan kode produk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Harga Beli</Label>
                <Input
                  id="edit-cost"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Harga Jual</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Satuan</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleSelectChange("unit", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleEditProduct} className="bg-primary hover:bg-primary-dark text-secondary-foreground">Perbarui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Penyesuaian Stok</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentProduct && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{currentProduct.name}</p>
                <p className="text-sm text-gray-500">Stok saat ini: {currentProduct.stock} {currentProduct.unit}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="stock-type">Tipe Penyesuaian</Label>
              <Select
                value={stockAdjustment.type}
                onValueChange={(value) => setStockAdjustment({...stockAdjustment, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Tambah Stok</SelectItem>
                  <SelectItem value="subtract">Kurangi Stok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-quantity">Jumlah</Label>
              <Input
                id="stock-quantity"
                type="number"
                value={stockAdjustment.quantity}
                onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: e.target.value})}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleStockAdjustment} className="bg-primary hover:bg-primary-dark text-secondary-foreground">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Inventory;

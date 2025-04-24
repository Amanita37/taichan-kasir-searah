
import { useState, useEffect } from "react";
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
  DialogDescription
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
  Image
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useProducts } from "@/hooks/useProducts";
import SupabaseInfoBox from "@/components/SupabaseInfoBox";

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
  image?: File;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const Inventory = () => {
  const { toast } = useToast();
  const {
    products,
    isLoadingProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage
  } = useProducts();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const filteredProducts = products ? products.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

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
    setImagePreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProduct = async () => {
    // Simple validation
    if (!formData.name || !formData.category || !formData.price || !formData.unit) {
      toast({
        title: "Validasi Gagal",
        description: "Nama, kategori, harga, dan satuan harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload image if provided
      let imageUrl = '/placeholder.svg';
      if (formData.image) {
        imageUrl = await uploadProductImage(formData.image);
      }
      
      // Add product to database
      await addProduct({
        name: formData.name,
        category: formData.category,
        price: parseInt(formData.price) || 0,
        barcode: formData.sku || null,
        stock: parseInt(formData.stock) || 0,
        image_url: imageUrl
      });
      
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: "Produk Ditambahkan",
        description: `${formData.name} berhasil ditambahkan ke inventaris.`,
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Gagal Menambahkan Produk",
        description: "Terjadi kesalahan saat menambahkan produk.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!currentProduct) return;

    // Simple validation
    if (!formData.name || !formData.category || !formData.price || !formData.unit) {
      toast({
        title: "Validasi Gagal",
        description: "Nama, kategori, harga, dan satuan harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Update product data
      const updateData: any = {
        name: formData.name,
        category: formData.category,
        price: parseInt(formData.price) || 0,
        barcode: formData.sku || null
      };
      
      // Upload and update image if provided
      if (formData.image) {
        updateData.image_url = await uploadProductImage(formData.image);
      }
      
      await updateProduct({ 
        id: currentProduct.id, 
        data: updateData 
      });
      
      setIsEditDialogOpen(false);
      resetForm();
      
      toast({
        title: "Produk Diperbarui",
        description: `${formData.name} berhasil diperbarui.`,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Gagal Memperbarui Produk",
        description: "Terjadi kesalahan saat memperbarui produk.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const productToDelete = products?.find((item) => item.id === id);
      
      if (!productToDelete) return;
      
      await deleteProduct(id);
      
      toast({
        title: "Produk Dihapus",
        description: `${productToDelete.name} berhasil dihapus dari inventaris.`,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Gagal Menghapus Produk",
        description: "Terjadi kesalahan saat menghapus produk.",
        variant: "destructive",
      });
    }
  };

  const handleStockAdjustment = async () => {
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

    try {
      // Calculate new stock
      const newStock = stockAdjustment.type === "add" 
        ? (currentProduct.stock + quantity)
        : Math.max(0, currentProduct.stock - quantity);
      
      // Update stock
      await updateProduct({
        id: currentProduct.id,
        data: { stock: newStock }
      });
      
      setIsStockDialogOpen(false);
      setStockAdjustment({ type: "add", quantity: "" });
      
      toast({
        title: "Stok Diperbarui",
        description: `Stok ${currentProduct.name} berhasil diperbarui.`,
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Gagal Memperbarui Stok",
        description: "Terjadi kesalahan saat memperbarui stok.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (product: any) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      sku: product.barcode || "",
      category: product.category,
      price: product.price?.toString() || "0",
      cost: "0", // Not stored in our schema currently
      stock: product.stock?.toString() || "0",
      unit: "pcs" // Not stored in our schema currently
    });
    setImagePreview(product.image_url);
    setIsEditDialogOpen(true);
  };

  const openStockDialog = (product: any) => {
    setCurrentProduct(product);
    setStockAdjustment({ type: "add", quantity: "" });
    setIsStockDialogOpen(true);
  };

  if (isLoadingProducts) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Memuat data inventaris...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!products) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Manajemen Inventaris</h1>
          <SupabaseInfoBox />
        </div>
      </DashboardLayout>
    );
  }

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
                  <TableHead>Gambar</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                          <img 
                            src={product.image_url || "/placeholder.svg"} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
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
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
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
            <div className="flex flex-col items-center space-y-2">
              <div 
                className="h-32 w-32 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden"
                style={{ position: 'relative' }}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview}
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    <Image className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-xs">Klik untuk upload gambar</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-sm text-gray-500">
                Upload gambar produk (opsional)
              </p>
            </div>
            
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
              <Label htmlFor="sku">Barcode / SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Masukkan kode produk (opsional)"
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
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button 
              onClick={handleAddProduct} 
              className="bg-primary hover:bg-primary-dark text-secondary-foreground"
              disabled={isUploading}
            >
              {isUploading ? "Menyimpan..." : "Simpan"}
            </Button>
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
            <div className="flex flex-col items-center space-y-2">
              <div 
                className="h-32 w-32 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden"
                style={{ position: 'relative' }}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview}
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    <Image className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-xs">Klik untuk upload gambar</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-sm text-gray-500">
                Upload gambar produk baru (opsional)
              </p>
            </div>
            
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
              <Label htmlFor="edit-sku">Barcode / SKU</Label>
              <Input
                id="edit-sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Masukkan kode produk (opsional)"
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
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button 
              onClick={handleEditProduct} 
              className="bg-primary hover:bg-primary-dark text-secondary-foreground"
              disabled={isUploading}
            >
              {isUploading ? "Menyimpan..." : "Perbarui"}
            </Button>
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
                <p className="text-sm text-gray-500">Stok saat ini: {currentProduct.stock}</p>
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
            <Button 
              onClick={handleStockAdjustment} 
              className="bg-primary hover:bg-primary-dark text-secondary-foreground"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Inventory;

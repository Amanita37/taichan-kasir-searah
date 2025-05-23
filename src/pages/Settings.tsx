
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/hooks/useSettings";
import SupabaseInfoBox from "@/components/SupabaseInfoBox";
import { type Database } from "@/integrations/supabase/types";

type Settings = Database["public"]["Tables"]["settings"]["Row"];

const Settings = () => {
  const { toast } = useToast();
  const { settings, isLoading, updateSettings } = useSettings();
  
  const [storeSettings, setStoreSettings] = useState<{
    store_name: string;
    store_address: string;
    store_phone: string;
    receipt_footer: string;
  }>({
    store_name: "",
    store_address: "",
    store_phone: "",
    receipt_footer: "",
  });
  
  // Additional settings that will be stored in local storage for now
  const [posSettings, setPosSettings] = useState({
    enableDiscount: true,
    enableTax: true,
    taxRate: "10",
    defaultPaymentMethod: "cash",
    autoLogout: "30",
    printReceipt: true,
  });
  
  const [inventorySettings, setInventorySettings] = useState({
    lowStockWarning: "5",
    enableBarcode: true,
    defaultUnit: "pcs",
    enableExpiration: true,
  });
  
  // Update form state when settings are loaded
  useEffect(() => {
    if (settings) {
      setStoreSettings({
        store_name: settings.store_name || "",
        store_address: settings.store_address || "",
        store_phone: settings.store_phone || "",
        receipt_footer: settings.receipt_footer || "",
      });
    }
  }, [settings]);
  
  const handleStoreSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoreSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePosSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPosSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handlePosSwitchChange = (name: string, checked: boolean) => {
    setPosSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleInventorySettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setInventorySettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleInventorySwitchChange = (name: string, checked: boolean) => {
    setInventorySettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSaveSettings = async (settingType: string) => {
    try {
      if (settingType === "store") {
        await updateSettings(storeSettings);
        
        toast({
          title: "Pengaturan Disimpan",
          description: "Pengaturan toko berhasil diperbarui.",
        });
      }
      else if (settingType === "pos") {
        // Save POS settings to localStorage
        localStorage.setItem('posSettings', JSON.stringify(posSettings));
        
        toast({
          title: "Pengaturan Disimpan",
          description: "Pengaturan POS berhasil diperbarui.",
        });
      } 
      else if (settingType === "inventory") {
        // Save inventory settings to localStorage
        localStorage.setItem('inventorySettings', JSON.stringify(inventorySettings));
        
        toast({
          title: "Pengaturan Disimpan",
          description: "Pengaturan inventaris berhasil diperbarui.",
        });
      }
    } catch (error) {
      toast({
        title: "Gagal Menyimpan Pengaturan",
        description: "Terjadi kesalahan saat menyimpan pengaturan.",
        variant: "destructive",
      });
    }
  };

  // Load local settings on component mount
  useEffect(() => {
    const savedPosSettings = localStorage.getItem('posSettings');
    const savedInventorySettings = localStorage.getItem('inventorySettings');
    
    if (savedPosSettings) {
      setPosSettings(JSON.parse(savedPosSettings));
    }
    
    if (savedInventorySettings) {
      setInventorySettings(JSON.parse(savedInventorySettings));
    }
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Memuat pengaturan...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!settings) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Pengaturan Sistem</h1>
          <SupabaseInfoBox />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Pengaturan Sistem</h1>
        </div>
        
        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="store">Pengaturan Toko</TabsTrigger>
            <TabsTrigger value="pos">Pengaturan POS</TabsTrigger>
            <TabsTrigger value="inventory">Pengaturan Inventaris</TabsTrigger>
          </TabsList>
          
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Toko</CardTitle>
                <CardDescription>
                  Atur informasi dasar tentang toko Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="store_name">Nama Toko</Label>
                      <Input
                        id="store_name"
                        name="store_name"
                        value={storeSettings.store_name}
                        onChange={handleStoreSettingChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store_phone">Nomor Telepon</Label>
                      <Input
                        id="store_phone"
                        name="store_phone"
                        value={storeSettings.store_phone}
                        onChange={handleStoreSettingChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="store_address">Alamat</Label>
                    <Textarea
                      id="store_address"
                      name="store_address"
                      value={storeSettings.store_address}
                      onChange={handleStoreSettingChange}
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pengaturan Struk</h3>
                  <div className="space-y-2">
                    <Label htmlFor="receipt_footer">Footer Struk</Label>
                    <Textarea
                      id="receipt_footer"
                      name="receipt_footer"
                      value={storeSettings.receipt_footer}
                      onChange={handleStoreSettingChange}
                      rows={2}
                    />
                  </div>
                </div>
                
                <Button 
                  className="pos-btn"
                  onClick={() => handleSaveSettings("store")}
                >
                  Simpan Pengaturan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pos">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan POS</CardTitle>
                <CardDescription>
                  Konfigurasi tampilan dan perilaku sistem kasir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Aktifkan Diskon</Label>
                      <p className="text-sm text-gray-500">Izinkan diskon pada transaksi penjualan</p>
                    </div>
                    <Switch
                      checked={posSettings.enableDiscount}
                      onCheckedChange={(checked) => handlePosSwitchChange("enableDiscount", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Aktifkan Pajak</Label>
                      <p className="text-sm text-gray-500">Terapkan pajak pada transaksi penjualan</p>
                    </div>
                    <Switch
                      checked={posSettings.enableTax}
                      onCheckedChange={(checked) => handlePosSwitchChange("enableTax", checked)}
                    />
                  </div>
                  
                  {posSettings.enableTax && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="taxRate">Tarif Pajak (%)</Label>
                      <Input
                        id="taxRate"
                        name="taxRate"
                        type="number"
                        value={posSettings.taxRate}
                        onChange={handlePosSettingChange}
                        className="w-32"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultPaymentMethod">Metode Pembayaran Default</Label>
                    <select
                      id="defaultPaymentMethod"
                      name="defaultPaymentMethod"
                      value={posSettings.defaultPaymentMethod}
                      onChange={(e) => handlePosSettingChange(e as any)}
                      className="pos-input w-full"
                    >
                      <option value="cash">Tunai</option>
                      <option value="debit">Kartu Debit</option>
                      <option value="credit">Kartu Kredit</option>
                      <option value="qris">QRIS</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="autoLogout">Otomatis Logout (menit)</Label>
                    <Input
                      id="autoLogout"
                      name="autoLogout"
                      type="number"
                      value={posSettings.autoLogout}
                      onChange={handlePosSettingChange}
                      className="w-32"
                    />
                    <p className="text-sm text-gray-500">Masukkan 0 untuk menonaktifkan</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cetak Struk Otomatis</Label>
                      <p className="text-sm text-gray-500">Cetak struk setelah selesai transaksi</p>
                    </div>
                    <Switch
                      checked={posSettings.printReceipt}
                      onCheckedChange={(checked) => handlePosSwitchChange("printReceipt", checked)}
                    />
                  </div>
                </div>
                
                <Button 
                  className="pos-btn"
                  onClick={() => handleSaveSettings("pos")}
                >
                  Simpan Pengaturan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Inventaris</CardTitle>
                <CardDescription>
                  Konfigurasi cara pengelolaan stok barang
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lowStockWarning">Peringatan Stok Menipis</Label>
                    <Input
                      id="lowStockWarning"
                      name="lowStockWarning"
                      type="number"
                      value={inventorySettings.lowStockWarning}
                      onChange={handleInventorySettingChange}
                      className="w-32"
                    />
                    <p className="text-sm text-gray-500">Batas stok yang memicu peringatan</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dukungan Barcode</Label>
                      <p className="text-sm text-gray-500">Aktifkan pemindaian barcode untuk produk</p>
                    </div>
                    <Switch
                      checked={inventorySettings.enableBarcode}
                      onCheckedChange={(checked) => handleInventorySwitchChange("enableBarcode", checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultUnit">Satuan Default</Label>
                    <select
                      id="defaultUnit"
                      name="defaultUnit"
                      value={inventorySettings.defaultUnit}
                      onChange={(e) => handleInventorySettingChange(e as any)}
                      className="pos-input w-full"
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="pack">Pack</option>
                      <option value="box">Box</option>
                      <option value="bottle">Botol</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Manajemen Tanggal Kadaluarsa</Label>
                      <p className="text-sm text-gray-500">Aktifkan pelacakan tanggal kadaluarsa produk</p>
                    </div>
                    <Switch
                      checked={inventorySettings.enableExpiration}
                      onCheckedChange={(checked) => handleInventorySwitchChange("enableExpiration", checked)}
                    />
                  </div>
                </div>
                
                <Button 
                  className="pos-btn"
                  onClick={() => handleSaveSettings("inventory")}
                >
                  Simpan Pengaturan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Tentang Aplikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Nama Aplikasi:</span> Taichan Searah - Sistem Manajemen Kasir Indonesia</p>
            <p><span className="font-medium">Versi:</span> 3.0.3</p>
            <p><span className="font-medium">Dikembangkan Oleh:</span> Recreya</p>
            <p className="text-sm text-gray-500 mt-2">© 2025 System developed by Recreya. All rights reserved.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

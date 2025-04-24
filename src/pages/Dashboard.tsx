
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Package, 
  Clock,
  Receipt,
  TrendingUp,
  Users
} from "lucide-react";
import SupabaseInfoBox from "@/components/SupabaseInfoBox";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Demo data (would come from Supabase in production)
  const stats = [
    { 
      name: "Penjualan Hari Ini", 
      value: "Rp 2,450,000", 
      change: "+12.5%", 
      icon: <TrendingUp className="h-8 w-8 text-green-500" /> 
    },
    { 
      name: "Transaksi", 
      value: "52", 
      change: "+5.2%", 
      icon: <ShoppingCart className="h-8 w-8 text-primary" /> 
    },
    { 
      name: "Produk Terjual", 
      value: "124", 
      change: "+8.1%", 
      icon: <Package className="h-8 w-8 text-blue-500" /> 
    },
    { 
      name: "Nilai Rata-Rata", 
      value: "Rp 47,115", 
      change: "+3.5%", 
      icon: <Receipt className="h-8 w-8 text-purple-500" /> 
    },
  ];

  const quickLinks = [
    { name: "POS", icon: ShoppingCart, path: "/pos", color: "bg-primary" },
    { name: "Inventory", icon: Package, path: "/inventory", color: "bg-blue-500" },
    { name: "Shift Management", icon: Clock, path: "/shift", color: "bg-green-500" },
    { name: "Receipts", icon: Receipt, path: "/receipt", color: "bg-purple-500" },
    { name: "User Management", icon: Users, path: "/users", color: "bg-red-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Button 
            className="pos-btn flex items-center gap-2"
            onClick={() => navigate("/pos")}
          >
            <ShoppingCart className="h-4 w-4" />
            Open POS
          </Button>
        </div>

        {/* Supabase connection info */}
        <SupabaseInfoBox />

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {quickLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <Button
                key={i}
                className={`${link.color} h-24 flex-col text-white hover:opacity-90`}
                onClick={() => navigate(link.path)}
              >
                <Icon className="mb-2 h-6 w-6" />
                {link.name}
              </Button>
            );
          })}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.name}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-500">{stat.change} vs kemarin</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                    <div className={`rounded-full p-2 ${i % 2 === 0 ? 'bg-primary/20' : 'bg-blue-100'}`}>
                      {i % 2 === 0 ? (
                        <ShoppingCart className="h-4 w-4 text-primary-dark" />
                      ) : (
                        <Package className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {i % 2 === 0 ? 'Transaksi baru' : 'Pembaruan stok'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString()} - {i % 2 === 0 ? 'Rp 120,000' : '10 item ditambahkan'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pengingat & Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="text-yellow-600">
                      ⚠️ <span className="font-medium">Peringatan Stok Rendah</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-yellow-700">
                    3 produk memiliki stok di bawah ambang batas minimum.
                  </div>
                </div>
                
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="text-blue-600">
                      ℹ️ <span className="font-medium">Shift Menjelang Selesai</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-blue-700">
                    Shift sore akan berakhir dalam 1 jam. Silakan persiapkan penutupan.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

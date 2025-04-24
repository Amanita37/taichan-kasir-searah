
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-secondary">
              <span className="text-primary">Taichan</span> Searah
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              Sistem Manajemen Kasir Indonesia
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
            <Button
              className="pos-btn text-lg px-8 py-6 flex items-center gap-2"
              onClick={() => navigate("/auth")}
            >
              Masuk Sekarang <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="pt-12">
            <img
              src="/placeholder.svg"
              alt="POS System Illustration"
              className="mx-auto max-w-md w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          
          <div className="space-y-4 pt-8">
            <h2 className="text-2xl font-semibold">Fitur Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="pos-card">
                <h3 className="text-lg font-medium mb-2">Manajemen Stok</h3>
                <p className="text-gray-600">Pantau dan kelola stok barang dengan mudah dan efisien</p>
              </div>
              <div className="pos-card">
                <h3 className="text-lg font-medium mb-2">Transaksi Cepat</h3>
                <p className="text-gray-600">Proses penjualan dengan cepat dan akurat</p>
              </div>
              <div className="pos-card">
                <h3 className="text-lg font-medium mb-2">Laporan Lengkap</h3>
                <p className="text-gray-600">Analisis bisnis dengan laporan penjualan terperinci</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-secondary py-6">
        <div className="container mx-auto px-4 text-center text-white">
          <p>© 2025 System developed by Recreya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

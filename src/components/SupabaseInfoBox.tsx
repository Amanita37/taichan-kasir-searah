
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SupabaseInfoBox = () => {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-primary-dark">Koneksi Supabase Diperlukan</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">
          Untuk mengaktifkan fitur autentikasi, penyimpanan data transaksi, dan manajemen produk,
          silakan hubungkan aplikasi Anda ke Supabase menggunakan integrasi Lovable.
        </p>
        <p className="text-sm mb-3">
          Klik tombol Supabase hijau di pojok kanan atas antarmuka Lovable, lalu pilih "Connect to Supabase".
        </p>
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            className="border-primary text-primary-dark"
            onClick={() => window.open("https://docs.lovable.dev/integrations/supabase/", "_blank")}
          >
            Pelajari Lebih Lanjut
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseInfoBox;

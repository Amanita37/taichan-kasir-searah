import { useToast } from "@/components/ui/use-toast";
import { type CartItem } from "@/types/pos";

export interface UseCartPrintProps {
  calculateTotal: () => number;
  cashAmount: number | "";
}

export const useCartPrint = ({ calculateTotal, cashAmount }: UseCartPrintProps) => {
  const { toast } = useToast();

  const handlePrintReceipt = (transactionItems: CartItem[], customerName = "", kasir = "Admin") => {
    try {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (!printWindow) {
        toast({
          title: "Gagal Mencetak",
          description: "Popup blocker mungkin mencegah pencetakan. Mohon izinkan pop-up untuk situs ini.",
          variant: "destructive",
          duration: 1000,
        });
        return;
      }
      
      // Get receipt settings
      const receiptWidth = 80; // Ukuran struk 80mm
      const storeName = "Taichan Searah"; // Nama toko
      const storeAddress = "Jl. Wahid Hasyim Ruko Blok B3, Jembatan 3 - Kota Palu"; // Alamat toko
      const storePhone = "0822 2324 4494"; // Nomor telepon
      const receiptFooter = "Terima Kasih Sudah Mampir Ke Searah."; // Footer struk
      
      const formatCurrencyPrint = (amount: number): string => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency", 
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount).replace("Rp", "Rp ");
      };
      
      const total = calculateTotal();
      
      // Generate transaction ID
      const today = new Date();
      const transactionId = `TRX-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Format current date & time
      const formattedDate = today.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const formattedTime = today.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Struk Pembayaran</title>
            <style>
              @page {
                size: ${receiptWidth}mm auto;
                margin: 0;
              }
              body {
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                margin: 0 auto; 
                padding: 5px 10px;
                width: ${receiptWidth-20}mm;
                text-align: center; 
              }
              .receipt {
                width: 100%;
                margin: 0 auto;    /* Tambahkan ini */
                text-align: center; /* Tambahkan ini */
              }
              .center {
                text-align: center;
              }
              .divider {
                border-top: 1px dashed #000;
                margin: 8px 0;
              }
              .item-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 2px;
                text-align: center; /* Tambahkan ini */
                width: 100%;        /* Tambahkan ini */
              }
              .item-details {
                font-size: 11px;
                margin-bottom: 4px;
                color: #333;
              }
              .bold {
                font-weight: bold;
              }
              .footer {
                text-align: center;
                color: #0000AA;
                font-weight: bold;
                margin-top: 10px;
                font-size: 11px;
              }
              .header-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 2px;
                font-size: 11px;
                text-align: center; /* Tambahkan ini */
                width: 100%;        /* Tambahkan ini */
                margin: 0 auto;     /* Tambahkan ini */
              }
              .store-name {
                font-size: 16px;
                font-weight: bold;
              }
              .store-details {
                font-size: 11px;
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="center">
                <div class="store-name">${storeName}</div>
                <div class="store-details">${storeAddress}</div>
                <div class="store-details">${storePhone}</div>
              </div>
      
              <div class="divider"></div>
              
              <div class="header-info">
                <span>No. Transaksi:</span>
                <span>${transactionId}</span>
              </div>
              
              <div class="header-info">
                <span>Tanggal:</span>
                <span>${formattedDate} kontol ${formattedTime}</span>
              </div>
              
              <div class="header-info">
                <span>Kasir:</span>
                <span>${kasir}</span>
              </div>
      
              <div class="divider"></div>
      
              ${transactionItems.map(item => `
                <div class="item-row">
                  <span>${item.name}</span>
                  <span>${formatCurrencyPrint(item.price * item.quantity)}</span>
                </div>
                <div class="item-details">
                  ${formatCurrencyPrint(item.price)} x ${item.quantity}
                </div>
              `).join('')}
      
              <div class="divider"></div>
      
              <div class="item-row bold">
                <span>Total:</span>
                <span>${formatCurrencyPrint(total)}</span>
              </div>
      
              ${typeof cashAmount === "number" ? `
              <div class="item-row">
                <span>Pembayaran (Cash):</span>
                <span>${formatCurrencyPrint(cashAmount)}</span>
              </div>
              <div class="item-row">
                <span>Kembalian:</span>
                <span>${formatCurrencyPrint(cashAmount - total)}</span>
              </div>
              ` : ''}
      
              <div class="divider"></div>
      
              <div class="footer">
                ${receiptFooter}
              </div>
            </div>
      
            <script>
              setTimeout(() => {
                try {
                  window.print();
                  window.close();
                } catch(e) {
                  console.error("Print error:", e);
                  window.close();
                }
              }, 500);
            </script>
          </body>
        </html>
      `);
      
      
      printWindow.document.close();
      
      toast({
        title: "Cetak Struk",
        description: "Struk sedang dicetak.",
        duration: 1000,
      });
      
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Gagal Mencetak",
        description: "Terjadi kesalahan saat mencetak struk.",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  return {
    handlePrintReceipt,
  };
};
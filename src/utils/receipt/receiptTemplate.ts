import { toast } from "@/components/ui/use-toast";
import { type CartItem } from "@/types/pos";

export interface UseCartPrintProps {
  calculateTotal: () => number;
  cashAmount: number | "";
}

interface ReceiptSettings {
  store_name?: string;
  store_address?: string;
  store_phone?: string;
  receipt_width?: number;
  receipt_footer?: string;
}

// Format date in Indonesian format like "8 Mei 2025 pukul 02:58"
const formatDate = (dateString?: string) => {
  const date = dateString ? new Date(dateString) : new Date();
  return `${date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })} pukul ${date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

// Format currency in Indonesian format (Rp 24.000)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", 
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount).replace("Rp", "Rp ");
};

// Export generateReceiptHTML as a standalone function
export const generateReceiptHTML = ({ 
  transaction,
  transactionItems, 
  settings, 
  isLightPrint = false,
  paperWidth = '80mm',
  printScale = 100
}: {
  transaction: any,
  transactionItems: CartItem[],
  settings?: ReceiptSettings,
  isLightPrint?: boolean,
  paperWidth?: string,
  printScale?: number
}): string => {
  // Get receipt width from settings or use default
  // Parse paperWidth (removes 'mm' if present)
  const receiptWidth = settings?.receipt_width || 
    (paperWidth.includes('mm') ? parseInt(paperWidth, 10) : parseInt(paperWidth, 10)) || 
    80;
  
  // Optimize CSS for thermal printers vs regular printers
  const thermalPrinterStyles = isLightPrint ? `
    @page {
      size: ${receiptWidth}mm auto;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    @media screen {
      body {
        max-width: 100vw;
        overflow-x: hidden;
      }
    }
    
    body {
      font-family: 'Arial', sans-serif;
      font-size: 12px;
      margin: 0; 
      padding: 5px 10px;
      width: ${receiptWidth-20}mm;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-text-size-adjust: none;
    }
    
    /* Center the receipt on the page */
    html {
      display: flex;
      justify-content: center;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }
    
    /* Use dotted dividers which print better on thermal printers */
    .divider {
      border-top: 1px dashed #000;
      margin: 8px 0;
    }
    
    /* Lighter text weight for cleaner thermal printing */
    * {
      font-weight: normal !important;
      line-height: 1.1 !important;
    }
    
    /* Reduce spacing for thermal printers */
    .space-y-2 > * + * {
      margin-top: 2px;
    }
    
    .space-y-1 > * + * {
      margin-top: 1px;
    }
  ` : `
    @page {
      margin: 0;
      padding: 0;
      size: ${receiptWidth}mm auto;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      font-size: 12px;
      padding: 2mm;
      margin: 0 auto;
      width: ${receiptWidth - 4}mm; /* Account for padding */
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
      display: flex;
      flex-direction: column;
      // align-items: center;
    }
    
    /* Center the receipt on the page */
    html {
      display: flex;
      justify-content: center;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }
    
    .divider {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    
    .space-y-2 > * + * {
      margin-top: 5px;
    }
    
    .space-y-1 > * + * {
      margin-top: 3px;
    }
  `;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Struk Pembayaran</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
        <style>
          ${thermalPrinterStyles}
          
          /* Layout & common styles */
          .receipt {
            width: 100%;
          }
          
          .header {
            text-align: center;
            margin-bottom: 5px;
          }
          
          .title {
            font-size: 16px;
            font-weight: bold;
          }
          
          .text-sm {
            font-size: 11px;
          }
          
          .flex {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          
          .font-medium {
            font-weight: 500;
          }
          
          .font-bold {
            font-weight: bold;
          }
          
          .footer {
            text-align: center;
            color: #0000AA;
            font-weight: bold;
            margin-top: 10px;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="title">${settings?.store_name || "Taichan Searah"}</div>
            <div class="text-sm">${settings?.store_address || "Jl. Wahid Hasyim Ruko Blok B3, Jembatan 3 - Kota Palu"}</div>
            <div class="text-sm">${settings?.store_phone || "0822 2324 4494"}</div>
          </div>
          
          <div class="divider"></div>
          
          <div>
            <div class="flex">
              <span>No. Transaksi:</span>
              <span>${transaction.transaction_number}</span>
            </div>
            <div class="flex">
              <span>Tanggal:</span>
              <span>${formatDate(transaction.created_at)}</span>
            </div>
            <div class="flex">
              <span>Kasir:</span>
              <span>${transaction.cashier_name}</span>
            </div>
            ${transaction.customer_name ? `
            <div class="flex">
              <span>Pelanggan:</span>
              <span>${transaction.customer_name}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="divider"></div>
          
          <div class="space-y-2">
            ${transactionItems.map((item) => `
              <div class="flex">
                <div>
                  <div>${item.name}</div>
                  <div class="text-sm">${formatCurrency(item.price)} x ${item.quantity}</div>
                </div>
                <div class="font-medium">
                  ${formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="divider"></div>
          
          <div class="space-y-1">
            <div class="flex">
              <span>Total:</span>
              <span class="font-bold">${formatCurrency(transaction.total)}</span>
            </div>
            ${typeof transaction.payment_amount === "number" ? `
            <div class="flex">
              <span>Pembayaran (${transaction.payment_method}):</span>
              <span>${formatCurrency(transaction.payment_amount)}</span>
            </div>
            <div class="flex">
              <span>Kembalian:</span>
              <span>${formatCurrency(Number(transaction.payment_amount) - Number(transaction.total))}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <p>${settings?.receipt_footer || "Terima Kasih Sudah Mampir Ke Searah."}</p>
          </div>
        </div>
        
        <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
        <script>
          window.onload = function() {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
              try {
                html2canvas(document.querySelector('.receipt')).then(canvas => {
                  const link = document.createElement('a');
                  link.download = "struk-${transaction.transaction_number}.png";
                  link.href = canvas.toDataURL();
                  link.click();
                  setTimeout(() => window.close(), 100);
                });
              } catch(e) {
                console.error("Image generation error:", e);
                alert("Gagal membuat gambar struk. Silakan coba lagi.");
                window.close();
              }
            } else {
              window.print();
              window.close();
            }
          }
        </script>
      </body>
    </html>
  `;
};

export const useCartPrint = ({ calculateTotal, cashAmount }: UseCartPrintProps) => {
  const handlePrintReceipt = (transactionItems: CartItem[], customerName = "", kasir = "Admin", settings?: ReceiptSettings) => {
    try {
      // Generate transaction ID
      const today = new Date();
      const transactionId = `TRX-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Calculate total
      const total = calculateTotal();
      
      // Transaction object with expected structure
      const transaction = {
        transaction_number: transactionId,
        created_at: new Date().toISOString(),
        cashier_name: kasir,
        customer_name: customerName || undefined,
        total: total,
        payment_method: "Cash",
        payment_amount: cashAmount || 0
      };
      
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
      
      // Generate HTML content for the receipt
      // Allow customizing paper width when printing
      const receiptHTML = generateReceiptHTML({
        transaction,
        transactionItems,
        settings,
        paperWidth: settings?.receipt_width ? `${settings.receipt_width}mm` : '80mm', // Default to 80mm if not specified
        isLightPrint: true // Set to true for better thermal printer compatibility
      });
      
      // Write the HTML to the new window
      printWindow.document.write(receiptHTML);
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

import { formatCurrency, formatDate } from "@/lib/utils";

interface PrintReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
}

export const printReceipt = ({ transaction, transactionItems, settings }: PrintReceiptProps) => {
  try {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) {
      console.error("Popup blocker mungkin mencegah pencetakan.");
      return;
    }
    
    const receiptWidth = settings?.receipt_width || 48;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Pembayaran</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media print {
              @page {
                margin: 0;
                padding: 0;
                size: ${receiptWidth}mm auto;
              }
              body {
                margin: 0;
                padding: 0;
                width: ${receiptWidth}mm;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                font-weight: bold !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              * {
                font-weight: bold !important;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              padding: 0;
              margin: 0;
              width: ${receiptWidth}mm;
              font-weight: bold;
            }
            .receipt {
              width: 100%;
              max-width: 100%;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .title {
              font-size: 14px;
              font-weight: bold;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
            }
            .item-detail {
              display: flex;
              flex-direction: column;
            }
            .total {
              font-weight: bold;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 10px;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="title">${settings?.store_name || "Taichan Searah"}</div>
              <div class="text-sm">${settings?.store_address || "Jl. Contoh No. 123, Jakarta"}</div>
              <div class="text-sm">${settings?.store_phone || "(021) 123-4567"}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="text-sm">
              <div class="flex justify-between">
                <span>No. Transaksi:</span>
                <span>${transaction?.transaction_number}</span>
              </div>
              <div class="flex justify-between">
                <span>Tanggal:</span>
                <span>${formatDate(transaction?.created_at)}</span>
              </div>
              <div class="flex justify-between">
                <span>Kasir:</span>
                <span>${transaction?.cashier_name}</span>
              </div>
              ${transaction?.customer_name ? `
              <div class="flex justify-between">
                <span>Pelanggan:</span>
                <span>${transaction?.customer_name}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="divider"></div>
            
            <div class="items space-y-2">
              ${transactionItems.map((item) => `
                <div class="flex justify-between">
                  <div>
                    <div>${item.product_name}</div>
                    <div class="text-sm">${formatCurrency(item.price)} x ${item.quantity}</div>
                  </div>
                  <div class="font-medium">
                    ${formatCurrency(item.total)}
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="divider"></div>
            
            <div class="totals space-y-1">
              <div class="flex justify-between">
                <span>Total:</span>
                <span class="font-bold">${formatCurrency(transaction?.total)}</span>
              </div>
              <div class="flex justify-between">
                <span>Pembayaran (${transaction?.payment_method}):</span>
                <span>${formatCurrency(transaction?.payment_amount)}</span>
              </div>
              <div class="flex justify-between">
                <span>Kembalian:</span>
                <span>${formatCurrency(Number(transaction?.payment_amount) - Number(transaction?.total))}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer text-center text-sm">
              <p>${settings?.receipt_footer || "Terima kasih atas kunjungan Anda!"}</p>
            </div>
          </div>
          <script>
            // Improved Android printing with better reliability
            function detectPrintEnvironment() {
              const userAgent = navigator.userAgent.toLowerCase();
              if (userAgent.includes('android')) {
                return 'android';
              } else if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
                return 'ios';
              } else {
                return 'desktop';
              }
            }

            // Force content to be fully loaded before printing
            function isDocumentReady() {
              return document.readyState === 'complete';
            }
            
            let printAttempts = 0;
            const MAX_PRINT_ATTEMPTS = 3;
            
            function handlePrint() {
              try {
                if (!isDocumentReady()) {
                  if (printAttempts < MAX_PRINT_ATTEMPTS) {
                    printAttempts++;
                    console.log("Document not fully loaded, waiting...", printAttempts);
                    setTimeout(handlePrint, 500);
                    return;
                  }
                }
                
                const env = detectPrintEnvironment();
                console.log("Print environment detected:", env);
                
                if (env === 'android') {
                  // For Android WebView
                  if (typeof Android !== 'undefined' && Android !== null) {
                    console.log("Using Android WebView printing");
                    
                    try {
                      // Set timeout for Android WebView to ensure DOM is fully rendered
                      setTimeout(() => {
                        if (typeof Android.printPage === 'function') {
                          console.log("Executing Android.printPage");
                          Android.printPage();
                        } else if (typeof Android.print === 'function') {
                          console.log("Executing Android.print");
                          Android.print();
                        } else {
                          console.log("Falling back to window.print for Android");
                          window.print();
                        }
                      }, 1000);
                    } catch (androidError) {
                      console.error("Android printing error:", androidError);
                      alert("Gagal mencetak struk. Coba lagi dengan menekan tombol print manual.");
                    }
                  } else {
                    // Standard printing if no Android interface
                    console.log("No Android interface found, using standard print");
                    setTimeout(() => window.print(), 1000);
                  }
                } else {
                  // Standard printing for desktop and iOS
                  console.log("Using standard print method");
                  setTimeout(() => window.print(), 800);
                }
                
                // Delay closing to ensure print completes
                setTimeout(() => {
                  console.log("Print operation completed");
                  window.close();
                }, 3000);
                
              } catch(e) {
                console.error("Print error:", e);
                // Don't close window on error to allow manual printing
                alert("Terjadi kesalahan saat mencetak: " + e.message + " - Silakan coba mencetak secara manual.");
              }
            }
            
            // Wait longer for Android to ensure content rendering
            if (detectPrintEnvironment() === 'android') {
              console.log("Android detected, extra delay for content rendering");
              setTimeout(handlePrint, 1500);
            } else {
              setTimeout(handlePrint, 800);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    console.log("Print window opened successfully");
    
  } catch (error) {
    console.error("Print error:", error);
  }
};


import { formatCurrency, formatDate } from "@/lib/utils";

interface ReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
  isLightPrint?: boolean;
}

/**
 * Generates the HTML content for a receipt
 */
export function generateReceiptHTML({ transaction, transactionItems, settings, isLightPrint = false }: ReceiptProps): string {
  const receiptWidth = settings?.receipt_width || 48; // 58mm printer typically uses 48mm paper width
  
  // Optimize CSS for ESC/POS thermal printers
  const thermalPrinterStyles = isLightPrint ? `
    @page {
      margin: 0;
      padding: 0;
      size: ${receiptWidth}mm auto;
    }
    
    body {
      font-family: monospace;
      font-size: 9px;
      padding: 1mm;
      margin: 0;
      width: ${receiptWidth - 2}mm; /* Account for padding */
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    
    /* Minimize borders and backgrounds for thermal printing */
    .divider {
      border-top: 1px dotted #000;
      margin: 4px 0;
      height: 1px;
    }
    
    /* Ensure all text is slightly bold for thermal printers without being too heavy */
    * {
      font-weight: normal !important;
      line-height: 1.1 !important;
    }
    
    /* Reduce space between items for thermal printers */
    .space-y-2 > * + * {
      margin-top: 3px;
    }
    
    .space-y-1 > * + * {
      margin-top: 2px;
    }
  ` : `
    @page {
      margin: 0;
      padding: 0;
      size: ${receiptWidth}mm auto;
    }
    
    body {
      font-family: 'Courier New', monospace;
      font-size: 10px;
      padding: 2mm;
      margin: 0;
      width: ${receiptWidth - 4}mm; /* Account for padding */
      font-weight: bold;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    
    .divider {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    
    /* Ensure all text is slightly bold for thermal printers */
    * {
      font-weight: 600 !important;
    }
    
    .space-y-2 > * + * {
      margin-top: 6px;
    }
    
    .space-y-1 > * + * {
      margin-top: 3px;
    }
  `;
  
  return `
    <html>
      <head>
        <title>Struk Pembayaran</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          ${thermalPrinterStyles}
          
          .receipt {
            width: 100%;
            max-width: 100%;
          }
          
          .header {
            text-align: center;
            margin-bottom: ${isLightPrint ? '4px' : '6px'};
          }
          
          .title {
            font-size: ${isLightPrint ? '10px' : '12px'};
            font-weight: bold;
          }
          
          .flex {
            display: flex;
            justify-content: space-between;
          }
          
          .item-detail {
            display: flex;
            flex-direction: column;
          }
          
          .font-medium, .font-bold {
            font-weight: bold;
          }
          
          .text-sm {
            font-size: ${isLightPrint ? '8px' : '9px'};
          }
          
          .footer {
            text-align: center;
            margin-top: ${isLightPrint ? '4px' : '6px'};
            font-size: ${isLightPrint ? '8px' : '9px'};
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
          
          <div>
            <div class="flex">
              <span>No. Transaksi:</span>
              <span>${transaction?.transaction_number}</span>
            </div>
            <div class="flex">
              <span>Tanggal:</span>
              <span>${formatDate(transaction?.created_at)}</span>
            </div>
            <div class="flex">
              <span>Kasir:</span>
              <span>${transaction?.cashier_name}</span>
            </div>
            ${transaction?.customer_name ? `
            <div class="flex">
              <span>Pelanggan:</span>
              <span>${transaction?.customer_name}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="divider"></div>
          
          <div class="space-y-2">
            ${transactionItems.map((item) => `
              <div class="flex">
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
          
          <div class="space-y-1">
            <div class="flex">
              <span>Total:</span>
              <span class="font-bold">${formatCurrency(transaction?.total)}</span>
            </div>
            <div class="flex">
              <span>Pembayaran (${transaction?.payment_method}):</span>
              <span>${formatCurrency(transaction?.payment_amount)}</span>
            </div>
            <div class="flex">
              <span>Kembalian:</span>
              <span>${formatCurrency(Number(transaction?.payment_amount) - Number(transaction?.total))}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <p>${settings?.receipt_footer || "Terima kasih atas kunjungan Anda!"}</p>
          </div>
        </div>
        ${generateOptimizedPrintScript(isLightPrint)}
      </body>
    </html>
  `;
}

/**
 * Generates the JavaScript needed for printing with better compatibility
 */
function generateOptimizedPrintScript(isLightPrint: boolean): string {
  // For light printing (Android thermal printers), use faster timeout values
  const initDelay = isLightPrint ? 300 : 800;
  const printDelay = isLightPrint ? 200 : 500;
  const closeDelay = isLightPrint ? 1000 : 2000;
  
  return `
    <script>
      // Improved printing with better compatibility for thermal printers
      function detectPrinterType() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('android')) {
          return ${isLightPrint ? "'android-thermal'" : "'android'"};
        } else if (userAgent.includes('windows')) {
          return 'windows';
        } else if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
          return 'ios';
        } else {
          return 'generic';
        }
      }
      
      // Wait for document to fully load
      function isDocumentReady() {
        return document.readyState === 'complete';
      }
      
      // Main print handler with retries and thermal printer support
      function handlePrint() {
        try {
          if (!isDocumentReady()) {
            console.log("Document not fully loaded, waiting...");
            setTimeout(handlePrint, ${printDelay});
            return;
          }
          
          const printerType = detectPrinterType();
          console.log("Printer type detected:", printerType);
          
          // Handle Android thermal printers (like POS-58)
          if (printerType === 'android-thermal') {
            console.log("Using Android thermal printer handling");
            
            // Check if Android bridge is available (for WebView integration)
            if (typeof Android !== 'undefined' && Android !== null) {
              console.log("Android interface detected");
              
              try {
                // Try different Android interfaces based on what's available
                if (typeof Android.printESCPOS === 'function') {
                  // Special function for ESC/POS protocol used by thermal printers
                  console.log("Using Android.printESCPOS");
                  Android.printESCPOS(document.documentElement.outerHTML);
                } else if (typeof Android.printHTML === 'function') {
                  console.log("Using Android.printHTML");
                  Android.printHTML(document.documentElement.outerHTML);
                } else if (typeof Android.printPage === 'function') {
                  console.log("Using Android.printPage");
                  Android.printPage();
                } else if (typeof Android.print === 'function') {
                  console.log("Using Android.print");
                  Android.print();
                } else {
                  // Fallback to standard printing
                  console.log("No Android printing interface found, using standard print");
                  window.print();
                }
              } catch (androidError) {
                console.error("Android printing error:", androidError);
                alert("Gagal mencetak: " + androidError.message);
              }
            } else {
              // No Android interface, try standard print
              console.log("No Android interface detected, using standard print");
              window.print();
            }
          } 
          // Handle Android browser with optimized settings
          else if (printerType === 'android') {
            console.log("Using optimized Android printing");
            // Use faster print call for Android
            window.print();
          }
          // Handle Windows printers
          else if (printerType === 'windows') {
            console.log("Using Windows printing");
            window.print();
          } 
          // Default print method
          else {
            console.log("Using standard printing");
            window.print();
          }
          
          // In case of success, close window after a delay
          setTimeout(() => {
            console.log("Print operation completed, closing window");
            window.close();
          }, ${closeDelay});
          
        } catch (e) {
          console.error("Print error:", e);
          alert("Terjadi kesalahan saat mencetak: " + e.message);
        }
      }
      
      // Start print process with appropriate delay
      setTimeout(handlePrint, ${initDelay});
    </script>
  `;
}

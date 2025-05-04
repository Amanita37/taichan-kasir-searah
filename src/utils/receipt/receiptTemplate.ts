
import { formatCurrency, formatDate } from "@/lib/utils";

interface ReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
  isLightPrint?: boolean;
  paperWidth?: string;
  printScale?: number;
}

/**
 * Generates the HTML content for a receipt
 * Optimized for various printer types including ESC/POS thermal printers
 */
export function generateReceiptHTML({ 
  transaction, 
  transactionItems, 
  settings, 
  isLightPrint = false,
  paperWidth = '48mm',
  printScale = 90
}: ReceiptProps): string {
  // Get receipt width from settings or use default
  const receiptWidth = settings?.receipt_width || parseInt(paperWidth, 10) || 48;
  
  // Optimize CSS for ESC/POS thermal printers vs regular printers
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
      background-color: white;
    }
    
    /* Use dotted dividers which print better on thermal printers */
    .divider {
      border-top: 1px dotted #000;
      margin: 3px 0;
      height: 1px;
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
    
    /* Regular font weight for normal printers */
    * {
      font-weight: 600 !important;
    }
    
    .space-y-2 > * + * {
      margin-top: 5px;
    }
    
    .space-y-1 > * + * {
      margin-top: 3px;
    }
  `;
  
  // Build the receipt HTML content
  return `
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
  `;
}

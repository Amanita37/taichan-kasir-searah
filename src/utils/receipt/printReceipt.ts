import { generateReceiptHTML } from './receiptTemplate';
import { detectPrintEnvironment } from './printEnvironment';

interface PrintReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
  retryCount?: number;
}

/**
 * Prints a receipt with better support for thermal printers like POS-58
 */
export const printReceipt = async ({ 
  transaction, 
  transactionItems, 
  settings,
  retryCount = 0
}: PrintReceiptProps) => {
  try {
    // Generate receipt HTML first
    const receiptHTML = generateReceiptHTML({ transaction, transactionItems, settings });
    
    // Check if we're in an Android WebView with printer support
    const isAndroidPrintSupported = window.navigator.userAgent.includes("Android") && 
      typeof window.Android !== 'undefined' && 
      (window.Android.printHTML || window.Android.printPage || window.Android.print);

    // For Android with direct printer support
    if (isAndroidPrintSupported) {
      console.log("Using Android bridge for direct printing");
      try {
        if (typeof window.Android.printHTML === 'function') {
          window.Android.printHTML(receiptHTML);
        } else if (typeof window.Android.printPage === 'function') {
          // Write to a temporary document first
          const printDoc = window.open('about:blank', '_blank');
          if (printDoc) {
            printDoc.document.write(receiptHTML);
            printDoc.document.close();
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for rendering
            window.Android.printPage();
            setTimeout(() => printDoc.close(), 1000);
          }
        } else if (typeof window.Android.print === 'function') {
          window.Android.print();
        }
        return;
      } catch (androidError) {
        console.error("Android print error:", androidError);
        // Fall through to regular print method
      }
    }

    // For regular browsers/printers
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (!printWindow) {
      if (retryCount < 3) {
        // Retry if popup was blocked
        console.log(`Retrying print (attempt ${retryCount + 1})`);
        return printReceipt({ 
          transaction, 
          transactionItems, 
          settings, 
          retryCount: retryCount + 1 
        });
      }
      throw new Error("Popup blocked. Please allow popups for this site.");
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { margin: 0; size: 80mm auto; }
            }
            body {
              font-family: 'Arial Narrow', Arial, sans-serif;
              font-size: 12px;
              width: 80mm;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body onload="window.print()">
          ${receiptHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Fallback in case onload print doesn't work
    const printFallback = () => {
      try {
        printWindow.print();
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      } catch (e) {
        console.error("Print fallback error:", e);
      }
    };

    // Handle print dialog for POS printers
    printWindow.addEventListener('afterprint', () => {
      setTimeout(() => printWindow.close(), 500);
    });

    // Fallback timeout if afterprint doesn't fire
    setTimeout(() => {
      if (!printWindow.closed) {
        printFallback();
      }
    }, 3000);

  } catch (error) {
    console.error("Print error:", error);
    throw error;
  }
};

declare global {
  interface Window {
    Android?: {
      printHTML?: (html: string) => void;
      printPage?: () => void;
      print?: () => void;
    };
  }
}

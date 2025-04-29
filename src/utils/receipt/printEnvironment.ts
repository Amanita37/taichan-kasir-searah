import { generateReceiptHTML } from './receiptTemplate';
import { detectPrintEnvironment } from './printEnvironment';

interface PrintReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
  retryCount?: number;
}

/**
 * Prints a receipt with proper Android print preview handling
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
    
    // Detect environment
    const env = detectPrintEnvironment();
    
    // Handle Android thermal printers differently
    if (env === 'android-thermal' && hasThermalPrinterSupport()) {
      return handleAndroidThermalPrint(receiptHTML);
    }

    // For regular browsers/printers
    return handleStandardPrint(receiptHTML, retryCount);
  } catch (error) {
    console.error("Print error:", error);
    throw error;
  }
};

/**
 * Handles printing for Android thermal printers
 */
async function handleAndroidThermalPrint(receiptHTML: string) {
  try {
    if (typeof window.Android?.printESCPOS === 'function') {
      // Direct ESC/POS command printing
      window.Android.printESCPOS(receiptHTML);
    } 
    else if (typeof window.Android?.printHTML === 'function') {
      // HTML printing
      window.Android.printHTML(receiptHTML);
    }
    else {
      // Fallback to standard print
      throw new Error("No direct print method available");
    }
  } catch (androidError) {
    console.warn("Android direct print failed, falling back to standard print", androidError);
    return handleStandardPrint(receiptHTML);
  }
}

/**
 * Handles standard browser printing with proper preview
 */
async function handleStandardPrint(receiptHTML: string, retryCount = 0) {
  // Create a hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  
  document.body.appendChild(iframe);
  
  return new Promise<void>((resolve, reject) => {
    iframe.onload = () => {
      try {
        // Write receipt content
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          throw new Error("Could not access iframe document");
        }
        
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt</title>
              <meta charset="utf-8">
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
            <body>
              ${receiptHTML}
              <script>
                // Add slight delay to ensure rendering
                setTimeout(() => {
                  window.print();
                  // Notify parent window when done
                  window.parent.postMessage('printComplete', '*');
                }, 200);
              </script>
            </body>
          </html>
        `);
        iframeDoc.close();
        
        // Listen for print completion
        const messageHandler = (event: MessageEvent) => {
          if (event.data === 'printComplete') {
            window.removeEventListener('message', messageHandler);
            setTimeout(() => {
              document.body.removeChild(iframe);
              resolve();
            }, 1000);
          }
        };
        window.addEventListener('message', messageHandler);
        
        // Fallback timeout
        setTimeout(() => {
          document.body.removeChild(iframe);
          resolve();
        }, 10000);
        
      } catch (error) {
        document.body.removeChild(iframe);
        reject(error);
      }
    };
    
    // Start loading
    iframe.src = 'about:blank';
  });
}

/**
 * Enhanced environment detection
 */
export function detectPrintEnvironment(): 'android' | 'android-thermal' | 'windows' | 'ios' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('android')) {
    return hasThermalPrinterSupport() ? 'android-thermal' : 'android';
  } 
  else if (userAgent.includes('windows')) {
    return 'windows';
  } 
  else if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return 'ios';
  } 
  else {
    return 'desktop';
  }
}

/**
 * Check for thermal printer support
 */
export function hasThermalPrinterSupport(): boolean {
  return (
    typeof window.Android !== 'undefined' && 
    window.Android !== null && 
    (
      typeof window.Android.printESCPOS === 'function' ||
      typeof window.Android.printHTML === 'function' ||
      typeof window.Android.printPage === 'function' ||
      typeof window.Android.print === 'function'
    )
  );
}

declare global {
  interface Window {
    Android?: {
      printESCPOS?: (html: string) => void;
      printHTML?: (html: string) => void;
      printPage?: () => void;
      print?: () => void;
    };
  }
}

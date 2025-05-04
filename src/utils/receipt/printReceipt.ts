// src/utils/receipt/printReceipt.ts
import { generateReceiptHTML } from './receiptTemplate';
import { detectPrintEnvironment, hasThermalPrinterSupport } from './printEnvironment';

interface PrintReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
  paperWidth?: string;
  printScale?: number;
  bypassPreview?: boolean;
}

/**
 * Prints a receipt by opening a new window with the receipt HTML or directly printing on supported devices
 * @param paperWidth - Width of the paper (e.g., '48mm', '80mm')
 * @param printScale - Scale for printing (e.g., 90 for 90%)
 * @param bypassPreview - Whether to bypass PDF preview (mobile optimization)
 */
export const printReceipt = ({ 
  transaction, 
  transactionItems, 
  settings,
  paperWidth = '48mm',
  printScale = 90,
  bypassPreview = true
}: PrintReceiptProps) => {
  try {
    // Detect environment first to determine the best printing method
    const env = detectPrintEnvironment();
    console.log(`Detected print environment: ${env}`);
    
    // Generate receipt HTML with optimized settings for thermal printers
    const receiptHTML = generateReceiptHTML({ 
      transaction, 
      transactionItems, 
      settings,
      isLightPrint: env === 'android' || env === 'android-thermal', // Use lighter printing for Android
      paperWidth,
      printScale
    });
    
    // ANDROID-SPECIFIC THERMAL PRINTER HANDLING
    // ---------------------------------------------
    if (env === 'android-thermal') {
      console.log("Using direct Android thermal printing method");
      
      // Try to use Android WebView bridge if available for thermal printing
      if (hasThermalPrinterSupport()) {
        console.log("Using Android bridge for direct thermal printing");
        
        // Try different Android printing methods
        if (typeof window.Android !== 'undefined' && window.Android !== null) {
          if (typeof window.Android.printESCPOS === 'function') {
            // Pass only the HTML and avoid extra parameters if not supported
            window.Android.printESCPOS(receiptHTML);
            return true;
          } else if (typeof window.Android.printHTML === 'function') {
            // Pass only the HTML and avoid extra parameters if not supported
            window.Android.printHTML(receiptHTML);
            return true;
          } else if (typeof window.Android.printPage === 'function') {
            // Create a hidden div to render the receipt
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = receiptHTML;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = paperWidth;
            tempDiv.style.transform = `scale(${printScale/100})`;
            tempDiv.style.transformOrigin = 'top left';
            document.body.appendChild(tempDiv);
            
            // Call Android printPage method
            window.Android.printPage();
            
            // Clean up
            setTimeout(() => document.body.removeChild(tempDiv), 1000);
            return true;
          } else if (typeof window.Android.print === 'function') {
            // Add print-optimized styling
            const styleEl = document.createElement('style');
            styleEl.textContent = `
              @media print {
                @page {
                  size: ${paperWidth} auto;
                  margin: 0;
                  scale: ${printScale}%;
                }
              }
            `;
            document.head.appendChild(styleEl);
            
            window.Android.print();
            
            // Remove style after print
            setTimeout(() => document.head.removeChild(styleEl), 1000);
            return true;
          }
        }
      }
    }
    
    // MOBILE OPTIMIZED PRINTING (Android and iOS)
    // ---------------------------------------------
    if (env === 'android' || env === 'ios') {
      console.log("Using optimized mobile printing");
      return useOptimizedMobilePrinting(receiptHTML, paperWidth, printScale);
    }
    
    // For all other environments, use the traditional popup window approach
    return usePrintWindow(receiptHTML, paperWidth, printScale);
    
  } catch (error) {
    console.error("Print error:", error);
    return false;
  }
};

/**
 * Optimized mobile printing without preview, specifically enhanced for Android devices
 */
function useOptimizedMobilePrinting(
  receiptHTML: string, 
  paperWidth: string = '48mm', 
  printScale: number = 90
): boolean {
  try {
    // Create a hidden iframe for printing
    const existingFrame = document.getElementById('mobile-print-frame');
    if (existingFrame) {
      document.body.removeChild(existingFrame);
    }
    
    const printFrame = document.createElement('iframe');
    printFrame.id = 'mobile-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '-9999px';
    printFrame.style.bottom = '-9999px';
    printFrame.style.width = paperWidth;
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);
    
    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      console.error("Could not access iframe document");
      return false;
    }
    
    // Write an optimized HTML document for Android printing
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Receipt</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
          <style>
            /* Aggressive print optimization for Android */
            @media print {
              @page {
                size: ${paperWidth} auto;
                margin: 0;
              }
              
              body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                margin: 0;
                padding: 0;
              }
            }
            
            /* Base styles */
            body {
              font-family: monospace;
              width: ${paperWidth};
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: none;
              background-color: white;
            }
          </style>
        </head>
        <body>
          ${receiptHTML}
          <script>
            (function() {
              // Very short timeout to prevent browser throttling
              setTimeout(function() {
                try {
                  window.focus();
                  window.print();
                  
                  // Clean up after printing
                  setTimeout(function() {
                    window.close();
                  }, 300);
                } catch (e) {
                  console.error("Print error:", e);
                }
              }, 200);
            })();
          </script>
        </body>
      </html>
    `);
    frameDoc.close();
    
    // Clean up after a short delay
    setTimeout(() => {
      if (document.getElementById('mobile-print-frame')) {
        document.body.removeChild(printFrame);
      }
    }, 3000);
    
    return true;
  } catch (error) {
    console.error("Mobile print error:", error);
    return false;
  }
}

/**
 * Helper function to handle printing via a popup window
 * Returns true if printing was initiated successfully
 * @param receiptHTML - HTML content for the receipt
 * @param paperWidth - Width of the paper
 * @param printScale - Scale for printing
 */
function usePrintWindow(receiptHTML: string, paperWidth: string = '48mm', printScale: number = 90): boolean {
  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) {
    console.error("Popup blocker may be preventing printing.");
    return false;
  }
  
  // Add style for print size and scale
  const printStyleSheet = `
    <style>
      @media print {
        @page {
          size: ${paperWidth} auto;
          margin: 0;
          scale: ${printScale}%;
        }
        body {
          width: ${paperWidth};
          margin: 0;
          padding: 0;
        }
        .receipt-container {
          width: 100%;
          transform: scale(${printScale/100});
          transform-origin: top left;
        }
      }
    </style>
  `;
  
  // Write HTML to the print window with the style
  printWindow.document.write(`<!DOCTYPE html><html><head>${printStyleSheet}</head><body><div class="receipt-container">${receiptHTML}</div></body></html>`);
  printWindow.document.close();
  
  console.log(`Print window opened successfully with paper width: ${paperWidth}, scale: ${printScale}%`);
  
  // Give the window some time to load fonts and render before printing
  setTimeout(() => {
    try {
      printWindow.print();
    } catch (printError) {
      console.error("Error during print operation:", printError);
      // Keep the window open if there's an error, so the user can manually print
      return false;
    }
    
    // Close the window after successful printing with a delay
    setTimeout(() => printWindow.close(), 1000);
  }, 800);
  
  return true;
}

// Update the Android interface to include parameters for paper size and scale
declare global {
  interface Window {
    Android?: {
      printESCPOS?: (html: string, paperWidth?: string, scale?: number) => void;
      printHTML?: (html: string, paperWidth?: string, scale?: number) => void;
      printPage?: () => void;
      print?: () => void;
    };
  }
}

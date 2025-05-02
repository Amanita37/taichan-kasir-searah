// src/utils/receipt/printReceipt.ts
import { generateReceiptHTML } from './receiptTemplate';
import { detectPrintEnvironment, hasThermalPrinterSupport } from './printEnvironment';

interface PrintReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
  paperWidth?: string;
  printScale?: number;
  bypassPreview?: boolean; // New option to bypass PDF preview
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
  bypassPreview = true // Default to bypass preview for better mobile experience
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
    
    // MOBILE OPTIMIZED PRINTING
    // ---------------------------------------------
    if (env === 'android' || env === 'android-thermal' || env === 'ios') {
      console.log("Using mobile-optimized printing method");
      return useIframeDirectPrintMethod(receiptHTML, paperWidth, printScale, bypassPreview);
    }
    
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
            window.Android.printESCPOS(receiptHTML, paperWidth, printScale);
            return true;
          } else if (typeof window.Android.printHTML === 'function') {
            window.Android.printHTML(receiptHTML, paperWidth, printScale);
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
    
    // For all other environments, use the traditional popup window approach
    return usePrintWindow(receiptHTML, paperWidth, printScale);
    
  } catch (error) {
    console.error("Print error:", error);
    return false;
  }
};

/**
 * Uses an iframe approach to bypass the PDF preview loading issue
 * This method is more reliable on mobile browsers
 */
function useIframeDirectPrintMethod(
  receiptHTML: string, 
  paperWidth: string = '48mm', 
  printScale: number = 90,
  bypassPreview: boolean = true
): boolean {
  try {
    // Remove any existing print frames
    const existingFrame = document.getElementById('direct-print-frame');
    if (existingFrame) {
      document.body.removeChild(existingFrame);
    }
    
    // Create a hidden iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.id = 'direct-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '-9999px';
    printFrame.style.bottom = '-9999px';
    printFrame.style.width = paperWidth;
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);
    
    // Get the iframe document
    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      console.error("Could not access iframe document");
      return false;
    }
    
    // Open the document and write the optimized printing HTML
    frameDoc.open();
    
    // Add style that forces direct printing and bypasses preview if requested
    const bypassPreviewStyle = bypassPreview ? `
      @media print {
        html, body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Force direct printing (experimental) */
        @page {
          margin: 0;
          size: ${paperWidth} auto;
        }
      }
      
      /* iOS print optimization */
      @supports (-webkit-overflow-scrolling: touch) {
        body {
          width: ${paperWidth};
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: none;
        }
      }
    ` : '';
    
    // Write enhanced HTML with direct print script
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Receipt</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${bypassPreviewStyle}
          </style>
        </head>
        <body>
          ${receiptHTML}
          <script>
            // Optimized print script with direct printing
            (function() {
              // Use very short timeout to avoid mobile browser throttling
              setTimeout(function() {
                try {
                  // Force direct printing - this will bypass preview on many mobile browsers
                  window.print();
                  
                  // iOS Safari needs focus to properly trigger print
                  window.focus();
                  
                  // Clean up after a delay
                  setTimeout(function() {
                    try {
                      // Attempt to close iframe connection
                      window.close();
                    } catch (e) {
                      console.log("Print complete");
                    }
                  }, 500);
                } catch (e) {
                  console.error("Print error:", e);
                }
              }, 100);
            })();
          </script>
        </body>
      </html>
    `);
    
    frameDoc.close();
    
    // Make sure the frame is removed after printing
    setTimeout(() => {
      try {
        if (document.getElementById('direct-print-frame')) {
          document.body.removeChild(printFrame);
        }
      } catch (e) {
        console.log("Frame cleanup error (non-critical):", e);
      }
    }, 5000);
    
    return true;
  } catch (error) {
    console.error("Direct iframe print error:", error);
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

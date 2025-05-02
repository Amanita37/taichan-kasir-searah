import { generateReceiptHTML } from './receiptTemplate';
import { detectPrintEnvironment, hasThermalPrinterSupport } from './printEnvironment';

interface PrintReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
  paperWidth?: string; // Menambahkan properti untuk lebar kertas
  printScale?: number; // Menambahkan properti untuk skala cetak
}

/**
 * Prints a receipt by opening a new window with the receipt HTML or directly printing on supported devices
 * @param paperWidth - Width of the paper (e.g., '48mm', '80mm')
 * @param printScale - Scale for printing (e.g., 90 for 90%)
 */
export const printReceipt = ({ 
  transaction, 
  transactionItems, 
  settings,
  paperWidth = '48mm', // Default lebar kertas 48mm
  printScale = 90 // Default skala cetak 90%
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
      paperWidth, // Meneruskan lebar kertas ke fungsi generateReceiptHTML
      printScale // Meneruskan skala cetak ke fungsi generateReceiptHTML
    });
    
    // Android-specific printing for thermal printers only
    if (env === 'android-thermal') {
      console.log("Using direct Android thermal printing method");
      
      // Try to use Android WebView bridge if available for thermal printing
      if (hasThermalPrinterSupport()) {
        console.log("Using Android bridge for direct thermal printing");
        
        // Try different Android printing methods
        if (typeof window.Android !== 'undefined' && window.Android !== null) {
          if (typeof window.Android.printESCPOS === 'function') {
            // Menambahkan konfigurasi untuk ukuran dan skala
            window.Android.printESCPOS(receiptHTML, paperWidth, printScale);
            return true;
          } else if (typeof window.Android.printHTML === 'function') {
            // Menambahkan konfigurasi untuk ukuran dan skala
            window.Android.printHTML(receiptHTML, paperWidth, printScale);
            return true;
          } else if (typeof window.Android.printPage === 'function') {
            // Create a hidden div to render the receipt
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = receiptHTML;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            // Set ukuran dan skala pada elemen
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
            // Menambahkan element style sebelum print
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
            
            // Hapus style setelah print
            setTimeout(() => document.head.removeChild(styleEl), 1000);
            return true;
          }
        }
      }
    }
    
    // For Android browsers, optimize the popup window for ESC/POS printing
    if (env === 'android') {
      console.log("Using optimized Android browser printing");
      const printWindow = window.open('', '', 'height=400,width=300');
      if (!printWindow) {
        console.error("Popup blocker preventing printing");
        return false;
      }
      
      // Menambahkan style untuk ukuran dan skala
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
      
      // Write optimized HTML to the print window with the style
      printWindow.document.write(`<!DOCTYPE html><html><head>${printStyleSheet}</head><body><div class="receipt-container">${receiptHTML}</div></body></html>`);
      printWindow.document.close();
      
      console.log("Optimized print window opened for Android");
      
      // Give the window minimal time to load before printing
      setTimeout(() => {
        try {
          printWindow.print();
          // Close the window after a shorter delay
          setTimeout(() => printWindow.close(), 500);
          return true;
        } catch (printError) {
          console.error("Print error:", printError);
          return false;
        }
      }, 300); // Use shorter timeout for Android
      
      return true;
    }
    
    // For all other environments, use the traditional popup window approach
    return usePrintWindow(receiptHTML, paperWidth, printScale);
    
  } catch (error) {
    console.error("Print error:", error);
    return false;
  }
};

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
  
  // Menambahkan style untuk ukuran dan skala
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

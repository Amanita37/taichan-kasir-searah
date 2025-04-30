import { generateReceiptHTML } from './receiptTemplate';
import { detectPrintEnvironment, hasThermalPrinterSupport } from './printEnvironment';

interface PrintReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
}

/**
 * Prints a receipt by opening a new window with the receipt HTML or directly printing on supported devices
 */
export const printReceipt = ({ transaction, transactionItems, settings }: PrintReceiptProps) => {
  try {
    // Detect environment first to determine the best printing method
    const env = detectPrintEnvironment();
    console.log(`Detected print environment: ${env}`);
    
    // Generate receipt HTML with optimized settings for thermal printers
    const receiptHTML = generateReceiptHTML({ 
      transaction, 
      transactionItems, 
      settings,
      isLightPrint: env === 'android' || env === 'android-thermal' // Use lighter printing for Android
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
            window.Android.printESCPOS(receiptHTML);
            return true;
          } else if (typeof window.Android.printHTML === 'function') {
            window.Android.printHTML(receiptHTML);
            return true;
          } else if (typeof window.Android.printPage === 'function') {
            // Create a hidden div to render the receipt
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = receiptHTML;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            
            // Call Android printPage method
            window.Android.printPage();
            
            // Clean up
            setTimeout(() => document.body.removeChild(tempDiv), 1000);
            return true;
          } else if (typeof window.Android.print === 'function') {
            window.Android.print();
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
      
      // Write optimized HTML to the print window
      printWindow.document.write(receiptHTML);
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
    return usePrintWindow(receiptHTML);
    
  } catch (error) {
    console.error("Print error:", error);
    return false;
  }
};

/**
 * Helper function to handle printing via a popup window
 * Returns true if printing was initiated successfully
 */
function usePrintWindow(receiptHTML: string): boolean {
  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) {
    console.error("Popup blocker may be preventing printing.");
    return false;
  }
  
  // Write HTML to the print window
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  
  console.log("Print window opened successfully");
  
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

// Add this to the global window type
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

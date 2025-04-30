import { generateReceiptHTML } from './receiptTemplate';
import { detectPrintEnvironment } from './printEnvironment';

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
    
    // Android-specific direct printing logic
    if (env === 'android' || env === 'android-thermal') {
      console.log("Using direct Android printing method");
      
      // Generate receipt HTML
      const receiptHTML = generateReceiptHTML({ transaction, transactionItems, settings });
      
      // Try to use Android WebView bridge if available
      if (typeof window.Android !== 'undefined' && window.Android !== null) {
        console.log("Using Android bridge for direct printing");
        
        // Try different Android printing methods
        if (typeof window.Android.printHTML === 'function') {
          window.Android.printHTML(receiptHTML);
          return;
        } else if (typeof window.Android.printESCPOS === 'function') {
          window.Android.printESCPOS(receiptHTML);
          return;
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
          return;
        } else if (typeof window.Android.print === 'function') {
          window.Android.print();
          return;
        }
      }
      
      // Fallback for Android browser - use hidden iframe for direct printing
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(receiptHTML);
        iframeDoc.close();
        
        setTimeout(() => {
          try {
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
          } catch (printError) {
            console.error("Direct print error:", printError);
            document.body.removeChild(iframe);
            // Fallback to popup window as last resort
            usePrintWindow(receiptHTML);
          }
        }, 500);
      } else {
        // If iframe method fails, fall back to popup window
        document.body.removeChild(iframe);
        usePrintWindow(receiptHTML);
      }
    } else {
      // For Windows, iOS, desktop and other environments, use the traditional popup window
      const receiptHTML = generateReceiptHTML({ transaction, transactionItems, settings });
      usePrintWindow(receiptHTML);
    }
  } catch (error) {
    console.error("Print error:", error);
  }
};

/**
 * Helper function to handle printing via a popup window
 */
function usePrintWindow(receiptHTML: string) {
  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) {
    console.error("Popup blocker mungkin mencegah pencetakan.");
    return;
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
      return;
    }
    
    // Close the window after successful printing with a delay
    setTimeout(() => printWindow.close(), 1000);
  }, 1000);
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

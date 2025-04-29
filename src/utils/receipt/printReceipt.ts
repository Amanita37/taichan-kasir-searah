import { generateReceiptHTML } from './receiptTemplate';
import { detectPrintEnvironment } from './printEnvironment';

interface PrintReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
}

/**
 * Prints a receipt by opening a new window with the receipt HTML
 */
export const printReceipt = ({ transaction, transactionItems, settings }: PrintReceiptProps) => {
  try {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) {
      console.error("Popup blocker mungkin mencegah pencetakan.");
      return;
    }
    
    // Generate receipt HTML
    const receiptHTML = generateReceiptHTML({ transaction, transactionItems, settings });
    
    // Write HTML to the print window
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    console.log("Print window opened successfully");
    
    // Give the window some time to load fonts and render before printing
    setTimeout(() => {
      try {
        const env = detectPrintEnvironment();
        console.log(`Detected print environment: ${env}`);
        
        // For ESC/POS printers like POS-58, we need a different approach
       if (typeof window.Android !== 'undefined' && typeof window.Android.printESCPOS === 'function') {
  console.log("Using Android.printESCPOS for direct printing");
  const escPosCommands = `
    \x1b@      // Initialize the printer
    \x1b!\x38  // Set font size
    Taichan Searah Receipt
    \x1b!\x00  // Reset font size
    Thank you for your purchase!
    \x0a\x0a\x0a
    \x1dV\x41  // Cut paper
  `;
  window.Android.printESCPOS(escPosCommands);
} else {
  console.log("Fallback to browser printing");
  printWindow.print();
}
          // For Windows and other operating systems
          printWindow.print();
        }
      } catch (printError) {
        console.error("Error during print operation:", printError);
        // Keep the window open if there's an error, so the user can manually print
        return;
      }
      
      // Close the window after successful printing with a delay
      setTimeout(() => printWindow.close(), 1000);
    }, 1000);
    
  } catch (error) {
    console.error("Print error:", error);
  }
};

// Add this to the global window type
declare global {
  interface Window {
    Android?: {
      printHTML?: (html: string) => void;
      printPage?: () => void;
      print?: () => void;
    };
  }
}

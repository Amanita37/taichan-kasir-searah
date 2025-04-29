
import { generateReceiptHTML } from './receiptTemplate';

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
    
  } catch (error) {
    console.error("Print error:", error);
  }
};

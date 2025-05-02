// src/utils/receipt/downloadReceipt.ts
import { generateReceiptHTML } from './receiptTemplate';

interface DownloadReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
  paperWidth?: string;
  fileName?: string;
}

/**
 * Downloads the receipt as a PDF file
 * Uses HTML2PDF library or generates a downloadable HTML file if PDF conversion is not available
 */
export const downloadReceiptAsPDF = ({
  transaction,
  transactionItems,
  settings,
  paperWidth = '48mm',
  fileName = 'receipt'
}: DownloadReceiptProps): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate the receipt HTML
      const receiptHTML = generateReceiptHTML({
        transaction,
        transactionItems,
        settings,
        isLightPrint: false // Use standard print for better PDF quality
      });

      // Try to load html2pdf dynamically if it's not already loaded
      if (typeof window.html2pdf === 'undefined') {
        try {
          // Load html2pdf.js from CDN
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
          console.log("html2pdf loaded successfully");
        } catch (error) {
          console.error("Failed to load html2pdf:", error);
          // Fall back to HTML download
          downloadAsHTML(receiptHTML, `${fileName}.html`);
          resolve(true);
          return;
        }
      }

      // Create temporary container for the receipt
      const container = document.createElement('div');
      container.innerHTML = receiptHTML;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      // Set today's date for the filename
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const safeFileName = `${fileName}-${transaction?.transaction_number || formattedDate}.pdf`;

      // Configure html2pdf options
      const opt = {
        margin: [0, 0, 0, 0],
        filename: safeFileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: [parseFloat(paperWidth.replace('mm', '')), 297], // Width from paperWidth, height auto
          orientation: 'portrait' 
        }
      };

      // Generate and download PDF
      window.html2pdf().set(opt).from(container).save().then(() => {
        // Clean up
        document.body.removeChild(container);
        console.log("Receipt PDF generated and downloaded successfully");
        resolve(true);
      }).catch((error: any) => {
        console.error("PDF generation error:", error);
        
        // Fallback to HTML download if PDF generation fails
        downloadAsHTML(receiptHTML, `${fileName}.html`);
        
        // Clean up
        document.body.removeChild(container);
        resolve(true);
      });
    } catch (error) {
      console.error("Download receipt error:", error);
      reject(error);
    }
  });
};

/**
 * Downloads receipt as HTML file (backup method)
 */
function downloadAsHTML(htmlContent: string, fileName: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

/**
 * Helper function to load external scripts
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// Extend Window interface to include html2pdf
declare global {
  interface Window {
    html2pdf: any;
  }
}

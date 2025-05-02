// Export function for direct download
export const downloadReceipt = ({ 
  transaction, 
  transactionItems, 
  settings,
  paperWidth = '48mm',
  printScale = 90
}: PrintReceiptProps): boolean => {
  return printReceipt({
    transaction,
    transactionItems,
    settings,
    paperWidth,
    printScale,
    downloadOnly: true
  });
};/**
 * Helper function to download receipt as PDF
 */
async function downloadReceiptAsPDF({ 
  receiptHTML, 
  transaction, 
  paperWidth, 
  printScale 
}: { 
  receiptHTML: string; 
  transaction: any; 
  paperWidth: string; 
  printScale: number; 
}): Promise<void> {
  try {
    // Use html2pdf.js or jsPDF if available
    if (typeof html2pdf !== 'undefined') {
      // Create a blob with the HTML content
      const blob = new Blob([receiptHTML], { type: 'text/html' });
      const receiptUrl = URL.createObjectURL(blob);
      
      // Generate filename from transaction
      const date = new Date();
      const filename = `receipt-${transaction.id || date.getTime()}.pdf`;
      
      // Create an iframe to render the HTML (hidden)
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      document.body.appendChild(iframe);
      
      // Load the HTML into the iframe
      iframe.onload = () => {
        try {
          // Use html2pdf with specific options
          const element = iframe.contentDocument.body;
          const opt = {
            margin: [0, 0, 0, 0],
            filename: filename,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { 
              scale: 2,
              useCORS: true,
              letterRendering: true,
              width: parseFloat(paperWidth) * 3.779527559 // Convert mm to px
            },
            jsPDF: { 
              unit: 'mm', 
              format: [parseFloat(paperWidth), 'auto'],
              orientation: 'portrait'
            }
          };
          
          html2pdf()
            .from(element)
            .set(opt)
            .save()
            .then(() => {
              // Clean up
              document.body.removeChild(iframe);
              URL.revokeObjectURL(receiptUrl);
            });
        } catch (err) {
          console.error('Error generating PDF:', err);
          // Fallback to plain HTML download
          downloadPlainHTML(receiptHTML, transaction);
        }
      };
      
      iframe.src = receiptUrl;
      
    } else {
      // Fallback if html2pdf is not available
      downloadPlainHTML(receiptHTML, transaction);
    }
  } catch (error) {
    console.error('Download error:', error);
    // Fallback to plain HTML download
    downloadPlainHTML(receiptHTML, transaction);
  }
}

/**
 * Fallback download function using Blob and saveAs
 */
function downloadPlainHTML(html: string, transaction: any): void {
  // Create a blob with the HTML content
  const blob = new Blob([html], { type: 'text/html' });
  
  // Generate filename from transaction
  const date = new Date();
  const filename = `receipt-${transaction.id || date.getTime()}.html`;
  
  // Download using saveAs or native methods
  if (typeof saveAs === 'function') {
    saveAs(blob, filename);
  } else {
    // Fallback for browsers without FileSaver.js
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  }
}    // Generate optimized receipt HTML if not already done
    const receiptHTML = generateOptimizedReceiptHTML({ 
      transaction, 
      transactionItems, 
      settings,
      isLightPrint: env === 'android' || env === 'android-thermal', // Use lighter printing for Android
      paperWidth, // Meneruskan lebar kertas ke fungsi generateReceiptHTML
      printScale, // Meneruskan skala cetak ke fungsi generateReceiptHTML
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });import { generateReceiptHTML } from './receiptTemplate';
import { detectPrintEnvironment, hasThermalPrinterSupport } from './printEnvironment';
import { saveAs } from 'file-saver'; // Import library untuk download

// Loading indicator functions
function showPrintLoadingIndicator(message: string = 'Menyiapkan Printer...'): HTMLElement {
  // Create loading overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.flexDirection = 'column';
  
  // Create loading spinner
  const spinner = document.createElement('div');
  spinner.innerHTML = message;
  spinner.style.backgroundColor = 'white';
  spinner.style.padding = '15px 20px';
  spinner.style.borderRadius = '5px';
  spinner.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  spinner.style.fontFamily = 'Arial, sans-serif';
  spinner.style.fontSize = '14px';
  spinner.style.fontWeight = 'bold';
  spinner.style.marginBottom = '10px';
  
  // Add cancel button on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Batal';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.marginTop = '10px';
    cancelButton.style.backgroundColor = '#f44336';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.onclick = () => {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };
    
    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'Download PDF';
    downloadButton.style.padding = '8px 16px';
    downloadButton.style.marginTop = '10px';
    downloadButton.style.backgroundColor = '#4CAF50';
    downloadButton.style.color = 'white';
    downloadButton.style.border = 'none';
    downloadButton.style.borderRadius = '4px';
    downloadButton.style.cursor = 'pointer';
    downloadButton.style.marginLeft = '10px';
    
    // Store reference for later use
    overlay.dataset.downloadButton = 'true';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(downloadButton);
    
    overlay.appendChild(spinner);
    overlay.appendChild(buttonContainer);
  } else {
    overlay.appendChild(spinner);
  }
  
  document.body.appendChild(overlay);
  
  return overlay;
}

function hidePrintLoadingIndicator(element: HTMLElement): void {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

interface PrintReceiptProps {
  transaction: any;
  transactionItems: any[];
  settings: any;
  paperWidth?: string; // Menambahkan properti untuk lebar kertas
  printScale?: number; // Menambahkan properti untuk skala cetak
  downloadOnly?: boolean; // Opsional: hanya download tanpa print pratinjau
}

interface OptimizedReceiptProps extends PrintReceiptProps {
  isLightPrint: boolean;
  isMobile: boolean;
}

/**
 * Optimizes receipt HTML for faster rendering on mobile devices
 */
function generateOptimizedReceiptHTML(props: OptimizedReceiptProps): string {
  try {
    // Get the base HTML from the template generator
    let html = generateReceiptHTML(props);
    
    // For mobile devices, apply optimizations to improve performance
    if (props.isMobile) {
      html = html
        // Remove unnecessary whitespace
        .replace(/\s{2,}/g, ' ')
        // Inline critical CSS and remove non-critical styles
        .replace(/<link\s+rel="stylesheet"[^>]*>/gi, '')
        // Remove large images or replace with smaller versions
        .replace(/<img\s+src="([^"]+)"([^>]*)>/gi, (match, src, attrs) => {
          // Keep only small images or logos
          if (src.includes('logo') || src.includes('icon')) {
            return `<img src="${src}" ${attrs.replace(/width="[^"]+"/i, 'width="48"').replace(/height="[^"]+"/i, 'height="auto"')}>`;
          }
          return ''; // Remove other images
        })
        // Optimize table structures
        .replace(/<table[^>]*>/gi, '<table style="width:100%;border-collapse:collapse;font-size:8px;">')
        // Remove heavy scripts
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    // Set print-specific styles
    const printStyles = `
      <style>
        @media print {
          @page {
            size: ${props.paperWidth} auto !important;
            margin: 0 !important;
          }
          body {
            margin: 0;
            padding: 0;
            width: ${props.paperWidth} !important;
            font-size: ${props.isMobile ? '9px' : '10px'} !important;
            line-height: 1.2 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          * {
            box-sizing: border-box !important;
          }
        }
        .receipt-content {
          width: 100% !important;
          max-width: ${props.paperWidth} !important;
          transform: scale(${props.printScale/100}) !important;
          transform-origin: top left !important;
        }
      </style>
    `;
    
    // Insert optimized print styles
    html = html.replace('</head>', `${printStyles}</head>`);
    
    // Wrap receipt content in a container with the specific width
    if (!html.includes('receipt-content')) {
      html = html.replace('<body>', '<body><div class="receipt-content">');
      html = html.replace('</body>', '</div></body>');
    }
    Color
    return html;
  } catch (error) {
    console.error("Error optimizing receipt HTML:", error);
    // Return original HTML if optimization fails
    return generateReceiptHTML(props);
  }
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
  printScale = 90, // Default skala cetak 90%
  downloadOnly = false // Default print normal, bukan download saja
}: PrintReceiptProps) => {
  // Show loading indicator
  const loadingIndicator = showPrintLoadingIndicator(downloadOnly ? 'Menyiapkan Download...' : 'Menyiapkan Printer...');
  
  try {
    // Detect environment first to determine the best printing method
    const env = detectPrintEnvironment();
    console.log(`Detected print environment: ${env}`);
    
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // If download only is requested, bypass print logic and go straight to download
    if (downloadOnly || (isMobile && env === 'android')) {
      // Generate receipt HTML first
      const receiptHTML = generateOptimizedReceiptHTML({ 
        transaction, 
        transactionItems, 
        settings,
        isLightPrint: true,
        paperWidth,
        printScale,
        isMobile: true
      });
      
      // Add download button functionality
      if (loadingIndicator.dataset.downloadButton === 'true') {
        const buttons = loadingIndicator.querySelectorAll('button');
        if (buttons.length >= 2) {
          const downloadButton = buttons[1];
          downloadButton.onclick = () => {
            downloadReceiptAsPDF({
              receiptHTML,
              transaction,
              paperWidth,
              printScale
            });
            // Hide loading indicator after download starts
            hidePrintLoadingIndicator(loadingIndicator);
          };
        }
      }
      
      // If download only mode, just return and let user click download button
      if (downloadOnly) {
        return true;
      }
      
      // For mobile Android, try to download PDF directly
      if (isMobile && env === 'android') {
        setTimeout(() => {
          downloadReceiptAsPDF({
            receiptHTML,
            transaction,
            paperWidth,
            printScale
          });
          // Hide loading indicator after download starts
          hidePrintLoadingIndicator(loadingIndicator);
        }, 500);
        return true;
      }
    }
    
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
    
    // For Android browsers, optimize for direct printing
    if (env === 'android') {
      console.log("Using optimized Android browser printing");
      
      // Use inline print approach to avoid popup loading issues
      try {
        // Create a hidden iframe for printing instead of popup window
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '-999px';
        printFrame.style.bottom = '-999px';
        printFrame.style.width = paperWidth;
        printFrame.style.height = '100%';
        printFrame.style.border = 'none';
        printFrame.name = 'print-frame-' + new Date().getTime();
        document.body.appendChild(printFrame);
        
        // Simplified and minimized content - avoid large resources
        const minimalStyleSheet = `
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @media print {
              @page {
                size: ${paperWidth} auto;
                margin: 0;
                scale: ${printScale}%;
              }
              body {
                width: ${paperWidth};
                font-size: 10px;
                line-height: 1.2;
              }
              img { max-width: 100%; height: auto; }
            }
            .receipt-container {
              width: 100%;
              transform: scale(${printScale/100});
              transform-origin: top left;
              padding: 2px;
            }
          </style>
        `;
        
        // Optimize HTML content
        const optimizedHTML = receiptHTML
          .replace(/<img\s+[^>]*>/gi, '') // Remove images 
          .replace(/\s{2,}/g, ' '); // Remove extra whitespace
        
        // Write minimal HTML to the iframe
        const printDocument = printFrame.contentWindow.document;
        printDocument.open();
        printDocument.write(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${minimalStyleSheet}</head><body><div class="receipt-container">${optimizedHTML}</div></body></html>`);
        printDocument.close();
        
        console.log("Optimized print frame loaded for Android");
        
        // Shorter timeout for Android - just enough to ensure rendering
        setTimeout(() => {
          try {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
            
            // Remove the iframe after printing (or after error timeout)
            setTimeout(() => {
              document.body.removeChild(printFrame);
            }, 1000);
            
            return true;
          } catch (printError) {
            console.error("Print error:", printError);
            document.body.removeChild(printFrame);
            return false;
          }
        }, 100); // Much shorter timeout to reduce waiting
      } catch (frameError) {
        console.error("Frame creation error:", frameError);
        
        // Fallback to direct printing if iframe approach fails
        const printStyle = document.createElement('style');
        printStyle.textContent = `
          @media print {
            @page { size: ${paperWidth} auto; margin: 0; scale: ${printScale}%; }
            body * { display: none; }
            #direct-print-container { display: block !important; width: ${paperWidth}; }
          }
        `;
        
        const printDiv = document.createElement('div');
        printDiv.id = 'direct-print-container';
        printDiv.innerHTML = receiptHTML;
        printDiv.style.position = 'absolute';
        printDiv.style.left = '-9999px';
        printDiv.style.width = paperWidth;
        
        document.head.appendChild(printStyle);
        document.body.appendChild(printDiv);
        
        window.print();
        
        // Cleanup
        setTimeout(() => {
          document.head.removeChild(printStyle);
          document.body.removeChild(printDiv);
        }, 1000);
      }
      
      return true;
    }
    
    // For all other environments, use the traditional popup window approach
    return usePrintWindow(receiptHTML, paperWidth, printScale);
    
  } catch (error) {
    console.error("Print error:", error);
    // Hide loading indicator on error
    hidePrintLoadingIndicator(loadingIndicator);
    return false;
  }
  
  // Hide loading indicator after print is initialized
  setTimeout(() => hidePrintLoadingIndicator(loadingIndicator), 1500);
  return true;
};

/**
 * Helper function to handle printing via a popup window
 * Returns true if printing was initiated successfully
 * @param receiptHTML - HTML content for the receipt
 * @param paperWidth - Width of the paper
 * @param printScale - Scale for printing
 */
function usePrintWindow(receiptHTML: string, paperWidth: string = '48mm', printScale: number = 90): boolean {
  // Detect if running on mobile or slow device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Use iframe approach for mobile devices to avoid popup loading issues
  if (isMobile) {
    try {
      // Create lightweight iframe for printing
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '-999px';
      printFrame.style.bottom = '-999px';
      printFrame.style.width = paperWidth;
      printFrame.style.height = '100%';
      printFrame.style.border = 'none';
      printFrame.name = 'print-frame-' + new Date().getTime();
      document.body.appendChild(printFrame);
      
      // Optimize the receipt HTML by removing unnecessary elements
      const optimizedHTML = receiptHTML
        .replace(/<img\s+[^>]*>/gi, '') // Remove images for faster loading
        .replace(/\s{2,}/g, ' ') // Remove extra whitespace
        .replace(/<link[^>]*>/gi, ''); // Remove external stylesheets
      
      // Create minimal styles with only essential formatting
      const minimalStyleSheet = `
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @media print {
            @page {
              size: ${paperWidth} auto;
              margin: 0;
              scale: ${printScale}%;
            }
            body {
              width: ${paperWidth};
              font-size: 10px;
              line-height: 1.2;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          .receipt-container {
            width: 100%;
            transform: scale(${printScale/100});
            transform-origin: top left;
            padding: 2px;
          }
        </style>
      `;
      
      // Write minimal HTML to the iframe
      const printDocument = printFrame.contentWindow.document;
      printDocument.open();
      printDocument.write(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${minimalStyleSheet}</head><body><div class="receipt-container">${optimizedHTML}</div></body></html>`);
      printDocument.close();
      
      console.log("Using optimized iframe print method for mobile");
      
      // Use shorter timeout for mobile devices
      setTimeout(() => {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
          
          // Remove the iframe after printing
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1000);
        } catch (printError) {
          console.error("Print error:", printError);
          document.body.removeChild(printFrame);
          return false;
        }
      }, 200); // Reduced timeout for mobile
      
      return true;
    } catch (e) {
      console.error("Mobile iframe print error:", e);
      // Fall back to direct body printing as last resort
      return useDirectPrinting(receiptHTML, paperWidth, printScale);
    }
  }
  
  // For desktop browsers, use the traditional popup approach with optimization
  try {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) {
      console.error("Popup blocker may be preventing printing.");
      return false;
    }
    
    // Optimized styling with fewer resources
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
    
    // Write minimal HTML to reduce loading time
    printWindow.document.write(`<!DOCTYPE html><html><head>${printStyleSheet}</head><body><div class="receipt-container">${receiptHTML}</div></body></html>`);
    printWindow.document.close();
    
    console.log(`Print window opened with width: ${paperWidth}, scale: ${printScale}%`);
    
    // Use shorter timeout for better responsiveness
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (printError) {
        console.error("Error during print operation:", printError);
        return false;
      }
      
      // Close the window after successful printing
      setTimeout(() => printWindow.close(), 800);
    }, 600);
    
    return true;
  } catch (error) {
    console.error("Print window error:", error);
    return false;
  }
}

/**
 * Last resort printing method that modifies the current page
 * Used as fallback when other methods fail
 */
function useDirectPrinting(receiptHTML: string, paperWidth: string, printScale: number): boolean {
  // Save current body content
  const originalContent = document.body.innerHTML;
  
  // Apply print-only styles
  const printStyle = document.createElement('style');
  printStyle.textContent = `
    @media print {
      @page { size: ${paperWidth} auto; margin: 0; scale: ${printScale}%; }
      body * { display: none; }
      #emergency-print-container { display: block !important; width: ${paperWidth}; }
    }
  `;
  
  // Create print container
  const printDiv = document.createElement('div');
  printDiv.id = 'emergency-print-container';
  printDiv.innerHTML = receiptHTML;
  printDiv.style.position = 'absolute';
  printDiv.style.left = '-9999px';
  
  // Apply changes
  document.head.appendChild(printStyle);
  document.body.appendChild(printDiv);
  
  // Print immediately
  window.print();
  
  // Restore original content
  setTimeout(() => {
    document.head.removeChild(printStyle);
    document.body.removeChild(printDiv);
  }, 500);
  
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

/**
 * Enhanced detection of the current print environment
 * Specifically improved for thermal printers like POS-58
 */
export function detectPrintEnvironment(): 'android' | 'android-thermal' | 'windows' | 'ios' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for Android devices
  if (userAgent.includes('android')) {
    // If we're in an Android WebView with printer capabilities
    if (typeof window.Android !== 'undefined' && window.Android !== null) {
      return 'android-thermal';
    }
    return 'android';
  } 
  // Check for Windows specifically
  else if (userAgent.includes('windows')) {
    return 'windows';
  } 
  // Check for iOS devices
  else if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return 'ios';
  } 
  // Default to desktop
  else {
    return 'desktop';
  }
}

/**
 * Checks if the document is fully loaded
 */
export function isDocumentReady(): boolean {
  return document.readyState === 'complete';
}

/**
 * Check if thermal printer capabilities are available
 */
export function hasThermalPrinterSupport(): boolean {
  // Check if in Android WebView with printer support
  if (typeof window.Android !== 'undefined' && window.Android !== null) {
    return (
      typeof window.Android.printESCPOS === 'function' ||
      typeof window.Android.printHTML === 'function' ||
      typeof window.Android.printPage === 'function' ||
      typeof window.Android.print === 'function'
    );
  }
  return false;
}

// Add this to global window type
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

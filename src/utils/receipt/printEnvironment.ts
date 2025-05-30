
/**
 * Enhanced detection of the current print environment
 * Specifically improved for thermal printers like POS-58
 */
export function detectPrintEnvironment(): 'android' | 'android-thermal' | 'windows' | 'ios' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for Android devices
  if (userAgent.includes('android')) {
    // Check if we're in an Android WebView with printer capabilities
    if (typeof window.Android !== 'undefined' && window.Android !== null) {
      return 'android-thermal';
    }
    
    // Check common thermal printer keywords
    if (
      userAgent.includes('pos') || 
      userAgent.includes('printer') || 
      userAgent.includes('thermal') ||
      userAgent.includes('sunmi') ||
      userAgent.includes('esc/pos') ||
      userAgent.includes('escpos') ||
      userAgent.includes('handheld') ||
      userAgent.includes('mobile pos') ||
      // Use feature detection for mobile instead of userAgentData
      (userAgent.includes('chrome') || userAgent.includes('firefox')) && 
      (/mobile|android/i.test(userAgent))
    ) {
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
  
  // Also check user agent for common thermal printer integrations
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('pos') || 
    userAgent.includes('printer') || 
    userAgent.includes('thermal') ||
    userAgent.includes('esc/pos') || 
    userAgent.includes('escpos') ||
    userAgent.includes('sunmi')
  );
}

// Add this to global window type
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

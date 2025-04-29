
/**
 * Detects the current print environment (Android, iOS, or desktop)
 */
export function detectPrintEnvironment(): 'android' | 'ios' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('android')) {
    return 'android';
  } else if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return 'ios';
  } else {
    return 'desktop';
  }
}

/**
 * Checks if the document is fully loaded
 */
export function isDocumentReady(): boolean {
  return document.readyState === 'complete';
}

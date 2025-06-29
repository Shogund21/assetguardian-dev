
import { useState, useEffect, useCallback } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isStable, setIsStable] = useState(false);
  
  const checkIfMobile = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const viewportWidth = window.innerWidth;
    const result = viewportWidth < MOBILE_BREAKPOINT;
    
    return result;
  }, []);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initial detection with stability check
    const initialResult = checkIfMobile();
    setIsMobile(initialResult);
    
    // Mark as stable after initial render
    const stabilityTimeout = setTimeout(() => {
      setIsStable(true);
    }, 100);
    
    // Debounced resize handler
    let resizeTimeout: number;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      resizeTimeout = window.setTimeout(() => {
        const newResult = checkIfMobile();
        setIsMobile(newResult);
      }, 150);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      clearTimeout(stabilityTimeout);
    };
  }, [checkIfMobile]);

  // Return loading state until detection is stable
  if (isMobile === null || !isStable) {
    return null;
  }

  return isMobile;
}

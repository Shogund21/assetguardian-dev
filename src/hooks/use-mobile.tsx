
import { useState, useEffect, useCallback } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
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
    
    // Initial detection - immediate result
    const initialResult = checkIfMobile();
    setIsMobile(initialResult);
    
    // Debounced resize handler
    let resizeTimeout: number;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      resizeTimeout = window.setTimeout(() => {
        const newResult = checkIfMobile();
        setIsMobile(newResult);
      }, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [checkIfMobile]);

  return isMobile;
}

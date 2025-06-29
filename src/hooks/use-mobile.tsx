
import { useState, useEffect, useCallback } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null); // Start with null to indicate loading
  const [isStable, setIsStable] = useState(false);
  
  const checkIfMobile = useCallback(() => {
    if (typeof window === 'undefined') {
      console.log("📱 useIsMobile: Server-side rendering, will detect on client");
      return false;
    }
    
    const viewportWidth = window.innerWidth;
    const result = viewportWidth < MOBILE_BREAKPOINT;
    
    console.log("📱 useIsMobile: Simple detection:", {
      viewportWidth,
      isMobile: result,
      breakpoint: MOBILE_BREAKPOINT
    });
    
    return result;
  }, []);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initial detection with stability check
    const initialResult = checkIfMobile();
    console.log("📱 useIsMobile: Initial detection result:", initialResult);
    setIsMobile(initialResult);
    
    // Mark as stable after initial render
    const stabilityTimeout = setTimeout(() => {
      setIsStable(true);
      console.log("📱 useIsMobile: Detection stabilized");
    }, 100);
    
    // Debounced resize handler
    let resizeTimeout: number;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      resizeTimeout = window.setTimeout(() => {
        const newResult = checkIfMobile();
        console.log("📱 useIsMobile: Resize detected, new result:", newResult);
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
    console.log("📱 useIsMobile: Still detecting, returning loading state");
    return null;
  }

  console.log("📱 useIsMobile: Stable result:", isMobile);
  return isMobile;
}

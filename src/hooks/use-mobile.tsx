
import { useState, useEffect, useCallback } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Default to true for mobile-first approach to avoid blank screens on phones
  const [isMobile, setIsMobile] = useState<boolean>(true);
  
  const checkIfMobile = useCallback(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      console.log("📱 useIsMobile: Server-side rendering, defaulting to mobile");
      return true;
    }
    
    // Check multiple conditions to better detect mobile devices
    const viewportWidth = window.innerWidth;
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    // UserAgent based detection as fallback
    const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent);
    
    // Width based detection (primary)
    const isMobileViewport = viewportWidth < MOBILE_BREAKPOINT;
    
    // Touch capability check
    const hasTouchCapability = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      (navigator as any).msMaxTouchPoints > 0;
    
    // Prioritize viewport width for consistent behavior
    const result = isMobileViewport || (isMobileUserAgent && hasTouchCapability);
    
    console.log("📱 useIsMobile: Detection results:", {
      viewportWidth,
      isMobileViewport,
      isMobileUserAgent,
      hasTouchCapability,
      finalResult: result,
      userAgent: userAgent.substring(0, 50) + "..."
    });
    
    return result;
  }, []);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Set initial value - check right away
    const initialResult = checkIfMobile();
    console.log("📱 useIsMobile: Initial detection result:", initialResult);
    setIsMobile(initialResult);
    
    // Handle both resize and orientation changes with debouncing
    let timeoutId: number | undefined;
    
    const handleViewportChange = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      
      timeoutId = window.setTimeout(() => {
        const newResult = checkIfMobile();
        console.log("📱 useIsMobile: Viewport change detected, new result:", newResult);
        setIsMobile(newResult);
      }, 100);
    };
    
    window.addEventListener('resize', handleViewportChange, { passive: true });
    window.addEventListener('orientationchange', handleViewportChange, { passive: true });
    
    // Force recheck after a short delay to account for any layout shifts
    const recheckTimeout = setTimeout(() => {
      const recheckResult = checkIfMobile();
      console.log("📱 useIsMobile: Delayed recheck result:", recheckResult);
      setIsMobile(recheckResult);
    }, 200);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      clearTimeout(recheckTimeout);
    };
  }, [checkIfMobile]);

  useEffect(() => {
    console.log("📱 useIsMobile: Final state changed to:", isMobile);
  }, [isMobile]);

  return isMobile;
}

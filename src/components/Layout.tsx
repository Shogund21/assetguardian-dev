
import React, { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { DesktopLayout } from "@/components/layout/DesktopLayout";
import { useViewportHeight } from "@/components/layout/LayoutVisibilityUtils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [debugInfo, setDebugInfo] = useState({ width: 0, height: 0 });
  
  // Apply viewport height adjustment
  useViewportHeight();
  
  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateDebugInfo();
    window.addEventListener('resize', updateDebugInfo);
    
    return () => window.removeEventListener('resize', updateDebugInfo);
  }, []);
  
  // Show loading state while mobile detection is stabilizing
  if (isMobile === null) {
    console.log("🔄 Layout: Mobile detection loading...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading layout...</p>
        </div>
      </div>
    );
  }
  
  console.log("🔄 Layout: Using layout type:", isMobile ? "MOBILE" : "DESKTOP");
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      {/* Enhanced debug overlay */}
      <div className="fixed top-4 left-4 bg-black text-white text-xs p-3 z-[300] rounded shadow-lg pointer-events-none">
        <div className="font-bold text-green-400">LAYOUT DEBUG</div>
        <div>Type: {isMobile ? "📱 MOBILE" : "🖥️ DESKTOP"}</div>
        <div>Size: {debugInfo.width}x{debugInfo.height}</div>
        <div>Breakpoint: &lt; 768px</div>
      </div>
      
      {/* Force mobile layout for testing if screen is small */}
      {isMobile ? (
        <MobileLayout>
          {children}
        </MobileLayout>
      ) : (
        <DesktopLayout>
          {children}
        </DesktopLayout>
      )}
    </SidebarProvider>
  );
};

export default Layout;

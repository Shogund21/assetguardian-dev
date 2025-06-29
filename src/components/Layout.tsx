
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
  
  // Apply viewport height adjustment
  useViewportHeight();
  
  // Add debugging state
  const [debugInfo, setDebugInfo] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateDebugInfo();
    window.addEventListener('resize', updateDebugInfo);
    
    console.log("🔄 Layout: Component mounted");
    console.log("🔄 Layout: Mobile detection result:", isMobile);
    console.log("🔄 Layout: Window dimensions:", debugInfo);
    
    return () => window.removeEventListener('resize', updateDebugInfo);
  }, []);
  
  // Force reflow on device type change to avoid layout issues
  useEffect(() => {
    console.log("🔄 Layout: Device type changed to:", isMobile ? "MOBILE" : "DESKTOP");
    
    // Small timeout to ensure DOM is ready
    const timeout = setTimeout(() => {
      // Force a reflow by accessing offsetHeight
      document.body.offsetHeight;
      console.log("🔄 Layout: Forced reflow completed");
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [isMobile]);
  
  // Use different layout approach for mobile vs desktop
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      {/* Debug overlay */}
      <div className="fixed bottom-4 left-4 bg-black text-white text-xs p-2 z-[200] rounded opacity-75 pointer-events-none">
        Layout: {isMobile ? "MOBILE" : "DESKTOP"}
        <br />
        {debugInfo.width}x{debugInfo.height}
      </div>
      
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

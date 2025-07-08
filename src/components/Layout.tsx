
import React from "react";
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
  
  // Mobile detection is now immediate, no loading state needed
  
  return (
    <div className="min-h-screen flex w-full">
      {isMobile ? (
        <MobileLayout>
          {children}
        </MobileLayout>
      ) : (
        <DesktopLayout>
          {children}
        </DesktopLayout>
      )}
    </div>
  );
};

export default Layout;

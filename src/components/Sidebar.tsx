
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNav } from "./sidebar/SidebarNav";
import { useSidebar } from "./ui/sidebar";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export default function Sidebar({ children, className, ...props }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  const { open: isOpen, setOpen } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle opening/closing sidebar when device type changes
  useEffect(() => {
    if (!isMobile) {
      setOpen(true); // Always show sidebar on desktop
    }
  }, [isMobile, setOpen]);

  // Don't attempt to render before mounting to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  const closeMenuOnMobile = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  // For desktop: standard sidebar in page layout with fixed width and position
  if (!isMobile) {
    return (
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-screen w-48 border-r border-gray-200 bg-white transition-all",
          !isOpen ? "-translate-x-full" : "translate-x-0",
          className
        )}
        data-sidebar="sidebar"
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        <SidebarHeader isMobile={isMobile} />
        <SidebarNav closeMenuOnMobile={closeMenuOnMobile} />
        {children}
      </aside>
    );
  }
  
  // For mobile: use Sheet component with improved touch handling
  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetOverlay className="z-40" />
      <SheetContent 
        side="left" 
        className="p-0 w-[260px] max-w-[75%] z-50 bg-white border-r mobile-sidebar-content"
        data-sidebar="sidebar"
        data-mobile="true"
        onPointerDown={(e) => e.stopPropagation()} // Prevent event bubbling
        style={{
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        <div className="flex h-full w-full flex-col">
          <SidebarHeader isMobile={isMobile} />
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <SidebarNav closeMenuOnMobile={closeMenuOnMobile} />
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

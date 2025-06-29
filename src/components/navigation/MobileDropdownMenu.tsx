
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LayoutDashboard, Wrench, Building2, ClipboardList, BarChart4, Settings, Brain, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function MobileDropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleSidebar } = useSidebar();
  
  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Equipment", icon: Wrench, path: "/equipment" },
    { title: "Projects", icon: Building2, path: "/projects" },
    { title: "Maintenance", icon: ClipboardList, path: "/maintenance-checks" },
    { title: "Predictive Maintenance", icon: Brain, path: "/predictive-maintenance" },
    { title: "Analytics", icon: BarChart4, path: "/analytics" },
    { title: "Settings", icon: Settings, path: "/settings" },
    { title: "Customer Manual", icon: FileText, path: "/customer-manual" }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };
  
  const handleSidebarToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSidebar();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleMenu}
        className="h-12 w-12 rounded-full bg-white/90 shadow-sm touch-manipulation"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-dropdown-menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-dropdown-menu"
            className="absolute right-0 top-14 w-64 rounded-lg bg-white shadow-lg border border-gray-100 z-50 animate-scale-in"
            style={{
              transformOrigin: 'top right',
            }}
          >
            <div className="p-2 flex flex-col gap-1">
              <Button
                variant="ghost"
                className="flex items-center justify-start px-3 py-2 text-left min-h-[44px]"
                onClick={handleSidebarToggle}
              >
                <span>Full Navigation</span>
              </Button>
              
              <div className="h-px bg-gray-100 my-1" />
              
              {/* Main Navigation Items */}
              {menuItems.map((item) => (
                <Link 
                  key={item.title} 
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md min-h-[44px]",
                    "hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                  )}
                  onClick={handleItemClick}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.title}</span>
                </Link>
              ))}
              
              <div className="h-px bg-gray-100 my-1" />
              
              {/* Sign Out Section */}
              <LogoutButton className="flex items-center justify-start gap-3 px-3 py-2 text-sm rounded-md min-h-[44px] w-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation font-normal">
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span>Sign Out</span>
              </LogoutButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

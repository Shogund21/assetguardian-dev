
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
            className="absolute right-0 top-14 w-72 max-h-[80vh] overflow-y-auto rounded-lg bg-white shadow-xl border border-gray-100 z-50 animate-scale-in"
            style={{
              transformOrigin: 'top right',
            }}
          >
            <div className="p-3 flex flex-col gap-1">
              <Button
                variant="ghost"
                className="flex items-center justify-start px-3 py-3 text-left min-h-[48px] font-medium text-blue-600"
                onClick={handleSidebarToggle}
              >
                <LayoutDashboard className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>Full Navigation</span>
              </Button>
              
              <div className="h-px bg-gray-200 my-2" />
              
              {/* Main Navigation Items */}
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link 
                    key={item.title} 
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 text-sm rounded-md min-h-[48px] w-full",
                      "hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation",
                      "text-gray-700 font-medium"
                    )}
                    onClick={handleItemClick}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                ))}
              </div>
              
              <div className="h-px bg-gray-200 my-2" />
              
              {/* Sign Out Section */}
              <LogoutButton className="flex items-center justify-start gap-3 px-3 py-3 text-sm rounded-md min-h-[48px] w-full hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation font-medium text-red-600 hover:text-red-700">
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

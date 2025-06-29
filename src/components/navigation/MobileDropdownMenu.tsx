
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LayoutDashboard, Wrench, Building2, ClipboardList, BarChart4, Settings, Brain, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function MobileDropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleSidebar } = useSidebar();
  
  // Hardcoded menu items for testing
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

  useEffect(() => {
    console.log("🔍 MobileDropdownMenu: Component mounted successfully");
    console.log("📱 MobileDropdownMenu: Menu items loaded:", menuItems.length);
    console.log("📱 MobileDropdownMenu: All menu items:", menuItems.map(item => `${item.title} -> ${item.path}`));
    
    // Test icon availability
    const iconTests = menuItems.map(item => ({
      title: item.title,
      iconExists: !!item.icon,
      iconName: item.icon?.name || 'unknown'
    }));
    console.log("📱 MobileDropdownMenu: Icon test results:", iconTests);
  }, []);

  useEffect(() => {
    console.log("📱 MobileDropdownMenu: Menu state changed to:", isOpen ? "OPEN" : "CLOSED");
  }, [isOpen]);

  const toggleMenu = () => {
    console.log("📱 MobileDropdownMenu: Toggle clicked, current state:", isOpen);
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: any) => {
    console.log("📱 MobileDropdownMenu: Menu item clicked:", item.title, "->", item.path);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Very visible debug indicator */}
      <div className="absolute -top-8 left-0 bg-yellow-400 text-black text-xs px-2 py-1 rounded pointer-events-none z-[400]">
        Menu: {menuItems.length} items
      </div>
      
      {/* Menu trigger button with enhanced visibility */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleMenu}
        className="h-12 w-12 rounded-full bg-white shadow-lg touch-manipulation border-4 border-purple-500"
        aria-label="Open menu"
        data-testid="mobile-dropdown-trigger"
      >
        {isOpen ? <X className="h-6 w-6 text-red-500" /> : <Menu className="h-6 w-6 text-blue-500" />}
      </Button>
      
      {/* Menu content */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={() => {
              console.log("📱 MobileDropdownMenu: Overlay clicked, closing menu");
              setIsOpen(false);
            }}
          />
          
          {/* Menu panel */}
          <div
            className="absolute right-0 top-16 w-80 max-h-[80vh] overflow-y-auto bg-white shadow-2xl border-4 border-green-500 z-[200] rounded-lg"
            data-testid="mobile-dropdown-content"
          >
            {/* Debug header - very visible */}
            <div className="bg-green-100 p-3 border-b-2 border-green-500">
              <div className="font-bold text-green-800">🔧 DEBUG: DROPDOWN MENU</div>
              <div className="text-sm text-green-700">Items loaded: {menuItems.length}</div>
            </div>
            
            <div className="p-4">
              {/* Quick sidebar access */}
              <Button
                variant="outline"
                className="w-full mb-3 p-3 border-2 border-blue-400"
                onClick={() => {
                  console.log("📱 MobileDropdownMenu: Opening sidebar");
                  toggleSidebar();
                  setIsOpen(false);
                }}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Open Full Sidebar
              </Button>
              
              <div className="border-t pt-3 mb-3"></div>
              
              {/* Navigation items */}
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 border-2 border-gray-200 transition-colors"
                    onClick={() => handleItemClick(item)}
                    data-testid={`mobile-nav-item-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className="flex-shrink-0">
                      {item.icon ? (
                        <item.icon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <div className="h-5 w-5 bg-red-500 rounded" title="Missing icon" />
                      )}
                    </div>
                    <span className="font-medium text-gray-800">{item.title}</span>
                    <span className="ml-auto text-xs text-gray-400">#{index + 1}</span>
                  </Link>
                ))}
              </div>
              
              <div className="border-t pt-3 mt-3">
                <LogoutButton className="w-full p-3 border-2 border-red-300 hover:bg-red-50 rounded-md flex items-center justify-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </LogoutButton>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LayoutDashboard, Wrench, Building2, ClipboardList, BarChart4, Settings, Brain, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function MobileDropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleSidebar } = useSidebar();
  
  // Menu items
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

  return (
    <div className="relative">
      {/* Menu trigger button */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleMenu}
        className="h-12 w-12 rounded-lg bg-white shadow-lg touch-manipulation hover:bg-gray-100"
        aria-label="Open menu"
      >
        {isOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
      </Button>
      
      {/* Menu content */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu panel */}
          <div className="absolute right-0 top-16 w-80 max-h-[80vh] overflow-y-auto bg-white shadow-2xl border border-gray-200 z-[200] rounded-lg">
            <div className="p-4">
              {/* Quick sidebar access */}
              <Button
                variant="outline"
                className="w-full mb-3 p-3 hover:bg-gray-50"
                onClick={() => {
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
                {menuItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 border border-gray-100 transition-colors"
                    onClick={handleItemClick}
                  >
                    <div className="flex-shrink-0">
                      <item.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-800">{item.title}</span>
                  </Link>
                ))}
              </div>
              
              <div className="border-t pt-3 mt-3">
                <LogoutButton className="w-full p-3 border border-red-200 hover:bg-red-50 rounded-md flex items-center justify-center gap-2 text-red-600">
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

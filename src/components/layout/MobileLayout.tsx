import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { CompanySelector } from "@/components/company/CompanySelector";
import { UserDropdown } from "@/components/sidebar/UserDropdown";
import MobileHint from "@/components/MobileHint";
import Sidebar from "@/components/Sidebar";
import { MobileDropdownMenu } from "@/components/navigation/MobileDropdownMenu";
import { NavigationTest } from "@/components/debug/NavigationTest";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  useEffect(() => {
    console.log("📱 MobileLayout: Component mounted - MOBILE LAYOUT ACTIVE");
    console.log("📱 MobileLayout: Window dimensions:", {
      width: window.innerWidth,
      height: window.innerHeight,
      userAgent: navigator.userAgent.substring(0, 50)
    });
    
    // Force visibility test
    const dropdown = document.querySelector('[data-mobile-dropdown]');
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    console.log("📱 MobileLayout: Navigation elements found:", {
      dropdown: !!dropdown,
      sidebar: !!sidebar
    });
  }, []);

  return (
    <div className="block h-screen w-full overflow-hidden bg-red-50">
      {/* Major debug indicator - should be very visible */}
      <div className="fixed top-20 left-4 bg-red-500 text-white text-sm p-4 z-[300] rounded-lg shadow-xl border-4 border-yellow-400">
        <div className="font-bold">🚨 MOBILE LAYOUT ACTIVE 🚨</div>
        <div>Width: {window.innerWidth}px</div>
        <div>Navigation should be visible below</div>
      </div>

      {/* Sidebar trigger - enhanced visibility */}
      <div className="fixed top-4 left-4 z-[200] bg-blue-500 p-2 rounded" data-sidebar-trigger-wrapper>
        <SidebarTrigger 
          className="bg-white shadow-lg h-12 w-12 touch-manipulation border-4 border-green-500 hover:bg-gray-100"
          aria-label="Toggle Menu"
          onClick={() => {
            console.log("📱 MobileLayout: SidebarTrigger clicked - should open sidebar");
          }}
        />
        <div className="text-white text-xs mt-1">Sidebar</div>
      </div>
      
      {/* Mobile dropdown menu - enhanced visibility */}
      <div className="fixed top-4 right-4 z-[200] bg-purple-500 p-2 rounded" data-mobile-dropdown>
        <MobileDropdownMenu />
        <div className="text-white text-xs mt-1 text-center">Dropdown</div>
      </div>
      
      {/* Navigation test indicator */}
      <div className="fixed top-32 right-4 bg-green-500 text-white text-xs p-3 z-[200] rounded">
        <div className="font-bold">NAV TEST</div>
        <div>Both navigation methods should be visible above</div>
        <div>Try clicking both buttons</div>
      </div>
      
      {/* Add navigation test component */}
      <NavigationTest />
      
      <MobileHint />
      <Sidebar />

      {/* Main content with enhanced debugging */}
      <div 
        className="bg-gray-50 min-h-screen w-full overflow-y-auto border-4 border-orange-500"
        data-testid="mobile-content"
      >
        <div className="h-full w-full pt-20 px-3 sm:px-4">
          {/* Application header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 bg-yellow-100 p-4 rounded">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
                alt="Asset Guardian Logo" 
                className="h-10 w-10 mr-3" 
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Asset Guardian</h1>
                <p className="text-sm text-gray-500">Facilities Management System (Mobile)</p>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="dashboard-content min-h-[200px] bg-blue-50 p-4 rounded border-2 border-blue-300">
            <div className="mb-4 text-sm text-gray-600">
              Content area - if you can see this, the mobile layout is working
            </div>
            {children || (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading content...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

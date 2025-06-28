
import React from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { CompanySelector } from "@/components/company/CompanySelector";
import { UserDropdown } from "@/components/sidebar/UserDropdown";
import MobileHint from "@/components/MobileHint";
import Sidebar from "@/components/Sidebar";
import { MobileDropdownMenu } from "@/components/navigation/MobileDropdownMenu";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div className="block h-screen w-full overflow-hidden">
      {/* Mobile sidebar trigger with enhanced z-index and tap area */}
      <div className="fixed top-4 left-4 z-[100]" data-sidebar-trigger-wrapper>
        <SidebarTrigger 
          className="bg-white/80 backdrop-blur-sm shadow-sm h-12 w-12 touch-manipulation"
          aria-label="Toggle Menu"
        />
      </div>
      
      {/* Mobile dropdown menu positioned at the top right */}
      <div className="fixed top-4 right-4 z-[100]">
        <MobileDropdownMenu />
      </div>
      
      {/* Mobile helper hint for first-time users */}
      <MobileHint />
      
      {/* Sidebar with proper mobile integration */}
      <Sidebar />

      {/* Main content area with scrolling enabled */}
      <div 
        className="bg-gray-50 min-h-screen w-full overflow-y-auto"
        data-testid="mobile-content"
      >
        <div className="h-full w-full pt-16 px-3 sm:px-4">
          {/* Application header with new logo and controls */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/4dfe5c17-1999-42ee-95ba-9c21b23df30a.png" 
                alt="Asset Guardian Logo" 
                className="h-10 w-10 mr-3" 
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Asset Guardian</h1>
                <p className="text-sm text-gray-500">Facilities Management System</p>
              </div>
            </div>
            
            {/* Company selector only shown in desktop view */}
            <div className="hidden sm:flex items-center space-x-2">
              <CompanySelector />
              <UserDropdown />
            </div>
          </div>
          
          {/* Main content with fallback */}
          <div className="dashboard-content min-h-[200px]">
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

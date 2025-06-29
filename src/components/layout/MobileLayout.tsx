
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import MobileHint from "@/components/MobileHint";
import Sidebar from "@/components/Sidebar";
import { MobileDropdownMenu } from "@/components/navigation/MobileDropdownMenu";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar trigger */}
      <div className="fixed top-4 left-4 z-[200]" data-sidebar-trigger-wrapper>
        <SidebarTrigger 
          className="bg-white shadow-lg h-12 w-12 touch-manipulation hover:bg-gray-100 rounded-lg"
          aria-label="Toggle Menu"
        />
      </div>
      
      {/* Mobile dropdown menu */}
      <div className="fixed top-4 right-4 z-[200]" data-mobile-dropdown>
        <MobileDropdownMenu />
      </div>
      
      <MobileHint />
      <Sidebar />

      {/* Main content */}
      <div 
        className="bg-gray-50 min-h-screen w-full overflow-y-auto"
        data-testid="mobile-content"
      >
        <div className="h-full w-full pt-20 px-3 sm:px-4">
          {/* Application header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
                alt="Asset Guardian Logo" 
                className="h-10 w-10 mr-3" 
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Asset Guardian</h1>
                <p className="text-sm text-gray-500">Facilities Management System</p>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="min-h-[200px]">
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

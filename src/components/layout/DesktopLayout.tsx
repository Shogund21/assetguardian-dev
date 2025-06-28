
import React from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  return (
    <div className="flex w-full overflow-hidden min-h-screen">
      {/* Sidebar with fixed width */}
      <Sidebar />

      {/* Main content with proper margin to prevent overlap */}
      <SidebarInset 
        className="flex-1 bg-gray-50 min-h-screen w-full overflow-y-auto pl-48" 
        data-testid="sidebar-inset"
      >
        <div className="w-full p-3 sm:p-4 md:p-6">
          {/* Application header with new logo and name */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
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
          
          {/* Render children with fallback */}
          <div className="dashboard-content min-h-[200px]">
            {children || (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading content...</p>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

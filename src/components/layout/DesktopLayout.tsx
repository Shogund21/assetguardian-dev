
import React from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const navigate = useNavigate();

  const handlePrintClick = () => {
    navigate('/print-view');
  };

  return (
    <div className="flex w-full overflow-hidden min-h-screen">
      {/* Sidebar with fixed width */}
      <Sidebar />

      {/* Main content with proper margin to prevent sidebar overlap */}
      <SidebarInset 
        className="flex-1 bg-gray-50 min-h-screen w-full overflow-y-auto pl-6 md:pl-48" 
        data-testid="sidebar-inset"
      >
        <div className="w-full p-2">
          {/* Application header with new logo and name */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
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
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintClick}
              className="flex items-center gap-2"
            >
              <Printer size={16} />
              Print
            </Button>
          </div>
          
          {/* Render children with fallback */}
          <div className="dashboard-content">
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

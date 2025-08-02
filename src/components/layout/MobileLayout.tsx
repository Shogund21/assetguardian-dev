
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileHint from "@/components/MobileHint";
import Sidebar from "@/components/Sidebar";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const navigate = useNavigate();

  const handlePrintClick = () => {
    navigate('/print-view');
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-gray-50">
      {/* Sidebar trigger */}
      <div className="fixed top-4 left-4 z-[200]">
        <SidebarTrigger 
          className="bg-white shadow-lg h-12 w-12 touch-manipulation hover:bg-gray-100 rounded-lg"
          aria-label="Toggle Menu"
        />
      </div>
      
      <MobileHint />
      <Sidebar />

      {/* Main content with mobile optimization */}
      <div className="bg-gray-50 min-h-screen w-full overflow-y-auto mobile-form-container">
        <div className="h-full w-full pt-20 px-2 sm:px-3">
          {/* Application header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
                alt="Asset Guardian Logo" 
                className="h-8 w-8 mr-2" 
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Asset Guardian</h1>
                <p className="text-xs text-gray-500">Facilities Management System</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintClick}
              className="flex items-center gap-1"
            >
              <Printer size={14} />
              Print
            </Button>
          </div>
          
          {/* Main content - ensure mobile compatibility */}
          <div className="min-h-[200px] mobile-form-container predictive-form overflow-y-auto">
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

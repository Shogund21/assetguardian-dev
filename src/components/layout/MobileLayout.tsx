
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
    <div className="h-screen w-full overflow-y-auto bg-gray-50 border-2 border-orange-500">
      <div className="text-orange-800 font-bold bg-orange-200 p-2 border border-orange-600 text-center">
        🔍 DEBUG: MobileLayout Root (Orange Border) - overflow-y-auto instead of overflow-hidden
      </div>
      
      {/* Sidebar trigger */}
      <div className="fixed top-4 left-4 z-[200]">
        <SidebarTrigger 
          className="bg-white shadow-lg h-12 w-12 touch-manipulation hover:bg-gray-100 rounded-lg"
          aria-label="Toggle Menu"
        />
      </div>
      
      {/* Mobile dropdown menu */}
      <div className="fixed top-4 right-4 z-[200]">
        <MobileDropdownMenu />
      </div>
      
      <MobileHint />
      <Sidebar />

      {/* Main content with mobile optimization */}
      <div className="bg-gray-50 min-h-screen w-full overflow-y-auto mobile-form-container border-2 border-teal-500">
        <div className="text-teal-800 font-bold bg-teal-200 p-2 border border-teal-600 text-center">
          🔍 DEBUG: Main Content Container (Teal Border) - overflow-y-auto
        </div>
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
          
          {/* Main content - ensure mobile compatibility */}
          <div className="min-h-[200px] mobile-form-container predictive-form overflow-y-auto border-2 border-indigo-500">
            <div className="text-indigo-800 font-bold bg-indigo-200 p-2 border border-indigo-600 text-center">
              🔍 DEBUG: Children Container (Indigo Border) - overflow-y-auto
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


import { useEffect, useState } from "react";
import CustomLayout from "@/components/CustomLayout";
import Stats from "@/components/dashboard/Stats";
import RecentActivities from "@/components/dashboard/RecentActivities";
import EquipmentOverview from "@/components/dashboard/EquipmentOverview";
import { FilterChangesOverview } from "@/components/dashboard/FilterChangesOverview";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { getUserDisplayName, isLoading: userLoading, isAuthenticated, isAdmin, userValidation } = useAuth();

  // Force content to render and stop loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <CustomLayout>
      <div className="dashboard-content min-h-[200px] bg-gray-50">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white p-6 rounded-xl mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <i className="fas fa-shield-alt text-2xl"></i>
                Dashboard
              </h1>
              <p className="text-blue-100 text-lg">Facility Management Overview</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              <div className="text-right">
                <span className="text-blue-100 block">
                  {userLoading ? "Loading..." : `Welcome, ${getUserDisplayName()}`}
                </span>
                {userValidation && (
                  <span className="text-xs text-blue-200">
                    {isAdmin() ? "Administrator" : "Technician"} Access
                  </span>
                )}
              </div>
              <button className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors duration-200">
                <i className="fas fa-bell text-lg"></i>
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="my-6 animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enhanced KPI Section */}
            <div className="my-6">
              <Stats />
            </div>
            
            {/* Content Sections */}
            {isMobile ? (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <RecentActivities />
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <FilterChangesOverview />
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <EquipmentOverview />
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100">
                    <RecentActivities />
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <FilterChangesOverview />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <EquipmentOverview />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomLayout>
  );
};

export default Index;

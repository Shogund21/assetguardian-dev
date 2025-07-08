
import { useEffect, useState } from "react";
import CustomLayout from "@/components/CustomLayout";
import Stats from "@/components/dashboard/Stats";
import RecentActivities from "@/components/dashboard/RecentActivities";
import EquipmentOverview from "@/components/dashboard/EquipmentOverview";
import { FilterChangesOverview } from "@/components/dashboard/FilterChangesOverview";
import { AuthDebugInfo } from "@/components/auth/AuthDebugInfo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { getUserDisplayName, isLoading: userLoading, isAuthenticated, isAdmin, userProfile } = useAuth();

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
        {/* Enhanced Header Section with Asset Guardian branding */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white p-6 rounded-xl mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
                alt="Asset Guardian Logo" 
                className="h-12 w-12 mr-4" 
              />
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  Dashboard
                  {userProfile?.is_demo_user && (
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">
                      Demo Mode
                    </span>
                  )}
                </h1>
                <p className="text-blue-100 text-lg">
                  {userProfile?.is_demo_user 
                    ? "Asset Guardian - Demo Experience • Explore all features with sample data"
                    : "Asset Guardian - Facility Management Overview"
                  }
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              <div className="text-right">
                <span className="text-blue-100 block">
                  {userLoading ? "Loading..." : `Welcome, ${getUserDisplayName()}`}
                </span>
                {userProfile && (
                  <span className="text-xs text-blue-200">
                    {userProfile.is_demo_user 
                      ? "Demo User"
                      : isAdmin() ? "Administrator" : "Technician"
                    } Access
                  </span>
                )}
              </div>
              <button className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors duration-200">
                <i className="fas fa-bell text-lg"></i>
              </button>
            </div>
          </div>
          {userProfile?.is_demo_user && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fas fa-info-circle text-white/80"></i>
                  <span className="text-sm text-white/90">
                    You're exploring Asset Guardian with demo data. Ready to get started with your own company?
                  </span>
                </div>
                <button className="bg-white text-purple-600 px-4 py-1 rounded-md text-sm font-medium hover:bg-white/90 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          )}
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
            {/* Auth Debug Info - Temporary for troubleshooting */}
            <AuthDebugInfo />
            
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

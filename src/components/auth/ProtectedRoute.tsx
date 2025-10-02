import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, authInitialized, userProfile } = useAuth();
  const location = useLocation();

  // Show loading while authentication is being determined
  if (isLoading || !authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img 
            src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
            alt="Asset Guardian Logo" 
            className="h-16 w-16 mx-auto mb-6 animate-pulse" 
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Asset Guardian...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has an approved account (for non-admin users)
  // Super admin (edward@shogunaillc.com) is always allowed
  if (userProfile && userProfile.email !== 'edward@shogunaillc.com') {
    // If user doesn't have user_role, they might not have been approved yet
    if (!userProfile.user_role) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-8">
            <img 
              src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
              alt="Asset Guardian Logo" 
              className="h-16 w-16 mx-auto mb-6" 
            />
            <h2 className="text-2xl font-bold mb-4">Account Pending Approval</h2>
            <p className="text-gray-600 mb-6">
              Your account is awaiting admin approval. You'll receive an email once your access is granted.
            </p>
            <button
              onClick={async () => {
                const { supabase } = await import("@/integrations/supabase/client");
                await supabase.auth.signOut();
                window.location.href = '/auth';
              }}
              className="text-primary hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, authInitialized, userProfile, user } = useAuth();
  const location = useLocation();
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

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

  // Check technician approval status when authenticated
  useEffect(() => {
    const checkTechnicianApproval = async () => {
      if (!user || !isAuthenticated) {
        setCheckingApproval(false);
        return;
      }

      // Super admin always has access
      if (userProfile?.email === 'edward@shogunaillc.com') {
        console.log("✅ Super admin access granted");
        setIsApproved(true);
        setCheckingApproval(false);
        return;
      }

      try {
        // Check if user has an approved technician record
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: technician, error } = await supabase
          .from('technicians')
          .select('account_status, user_role, email')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("❌ Error checking technician status:", error);
          setIsApproved(false);
          setCheckingApproval(false);
          return;
        }

        // If no technician record found, check by email
        if (!technician) {
          const { data: techByEmail } = await supabase
            .from('technicians')
            .select('account_status, user_role, email')
            .eq('email', user.email)
            .maybeSingle();

          if (techByEmail && techByEmail.account_status === 'active') {
            console.log("✅ User approved (matched by email):", user.email);
            setIsApproved(true);
          } else {
            console.log("❌ No approved technician record found for:", user.email);
            setIsApproved(false);
          }
        } else if (technician.account_status === 'active') {
          console.log("✅ User approved:", technician.email);
          setIsApproved(true);
        } else {
          console.log("❌ User not approved. Status:", technician.account_status);
          setIsApproved(false);
        }
      } catch (error) {
        console.error("❌ Error checking approval:", error);
        setIsApproved(false);
      }

      setCheckingApproval(false);
    };

    checkTechnicianApproval();
  }, [user, isAuthenticated, userProfile]);

  // Show loading while checking auth or approval
  if (isLoading || !authInitialized || checkingApproval) {
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

  // Block access if not approved
  if (!isApproved) {
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

  return <>{children}</>;
};
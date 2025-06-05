
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { checkAuthStatus, ValidationResult } from "@/services/emailValidationService";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userValidation, setUserValidation] = useState<ValidationResult | null>(null);

  const checkAuth = () => {
    try {
      const authStatus = checkAuthStatus();
      console.log("Auth status check:", authStatus);
      
      if (authStatus.isAuthenticated && authStatus.userData) {
        // Create a mock user object compatible with Supabase User type
        const mockUser: User = {
          id: authStatus.userData.email,
          email: authStatus.userData.email,
          aud: 'authenticated',
          role: 'authenticated',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_anonymous: false
        };

        setUser(mockUser);
        setUserValidation({
          isValid: true,
          userType: authStatus.userData.userType,
          userData: authStatus.userData.userData
        });
      } else {
        setUser(null);
        setUserValidation(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
      setUserValidation(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'assetguardian_auth') {
        console.log("Storage change detected, rechecking auth");
        checkAuth();
      }
    };

    // Listen for custom auth update events
    const handleAuthUpdate = () => {
      console.log("Auth update event received, rechecking auth");
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthUpdate);
    };
  }, []);

  const getUserDisplayName = () => {
    if (!user || !userValidation?.userData) return "Guest";
    
    // Use the name from validation data
    if (userValidation.userData.name) {
      return userValidation.userData.name;
    }
    
    // Fall back to email (remove domain part for cleaner display)
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return "User";
  };

  const isAdmin = () => {
    return userValidation?.userType === "admin";
  };

  const isTechnician = () => {
    return userValidation?.userType === "technician";
  };

  const hasPermission = (permission: string) => {
    if (isAdmin()) return true; // Admin has all permissions
    return userValidation?.userData?.permissions?.includes(permission) || false;
  };

  const hasFullAccess = () => {
    return isAdmin() || userValidation?.userData?.hasFullAccess === true;
  };

  return {
    user,
    isLoading,
    getUserDisplayName,
    isAuthenticated: !!user && !!userValidation?.isValid,
    userValidation,
    isAdmin,
    isTechnician,
    hasPermission,
    hasFullAccess,
    forceAuthCheck: checkAuth
  };
};

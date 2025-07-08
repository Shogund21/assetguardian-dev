
import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authService, UserProfile } from "@/services/authService";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    console.log("🚀 Initializing authentication...");
    
    // Force clear any corrupted session data
    const clearCorruptedSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && (!session.access_token || !session.user?.id)) {
          console.warn("🧹 Clearing corrupted session data");
          await supabase.auth.signOut();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error checking session:", error);
        return false;
      }
    };

    const initializeAuth = async () => {
      // Clear any corrupted sessions first
      const wasCorrupted = await clearCorruptedSession();
      if (wasCorrupted) {
        setIsLoading(false);
        setAuthInitialized(true);
        return;
      }

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("🔄 Auth state changed:", event, session?.user?.email);
          console.log("Session details:", {
            hasSession: !!session,
            hasAccessToken: !!session?.access_token,
            hasUser: !!session?.user,
            userId: session?.user?.id,
            tokenLength: session?.access_token?.length
          });
          
          // Handle session state updates synchronously
          setSession(session);
          setUser(session?.user ?? null);
          
          // Handle profile loading asynchronously
          if (session?.user && session.access_token) {
            // Defer profile loading to avoid blocking auth state
            setTimeout(async () => {
              try {
                const profile = await authService.getUserProfile(session.user.id);
                console.log("👤 User profile loaded:", profile?.email);
                setUserProfile(profile);
                setIsLoading(false);
              } catch (error) {
                console.error("❌ Error loading user profile:", error);
                setUserProfile(null);
                setIsLoading(false);
              }
            }, 100);
          } else {
            setUserProfile(null);
            setIsLoading(false);
          }
          
          setAuthInitialized(true);
        }
      );

      // Check for existing session after setting up listener
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting initial session:", error);
          setIsLoading(false);
          setAuthInitialized(true);
          return;
        }
        
        console.log("🔍 Initial session check:", {
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          hasUser: !!session?.user,
          userEmail: session?.user?.email
        });
        
        // If we have a valid session, the auth state change will handle it
        // If no session, set loading to false
        if (!session) {
          setIsLoading(false);
          setAuthInitialized(true);
        }
        
      } catch (error) {
        console.error("❌ Failed to get initial session:", error);
        setIsLoading(false);
        setAuthInitialized(true);
      }

      return () => subscription.unsubscribe();
    };

    const cleanup = initializeAuth();
    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then(cleanupFn => cleanupFn?.());
      }
    };
  }, []);

  const getUserDisplayName = () => {
    if (!userProfile) return "Guest";
    
    // Use first/last name if available
    if (userProfile.first_name || userProfile.last_name) {
      return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
    }
    
    // Fall back to email (remove domain part for cleaner display)
    if (userProfile.email) {
      return userProfile.email.split('@')[0];
    }
    
    return "User";
  };

  const isAdmin = () => {
    return authService.isAdmin(userProfile);
  };

  const isTechnician = () => {
    return userProfile?.user_role === "technician" || userProfile?.user_role === "senior_technician";
  };

  const hasPermission = (permission: string) => {
    return authService.hasPermission(userProfile, permission);
  };

  const hasFullAccess = () => {
    return isAdmin();
  };

  return {
    user,
    session,
    userProfile,
    isLoading,
    authInitialized,
    getUserDisplayName,
    isAuthenticated: !!user && !!session && !!session.access_token,
    isAdmin,
    isTechnician,
    hasPermission,
    hasFullAccess,
    // Auth actions
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
    resetPassword: authService.resetPassword,
    updatePassword: authService.updatePassword
  };
};

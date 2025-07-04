
import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authService, UserProfile } from "@/services/authService";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load user profile when session is established
        if (session?.user) {
          setTimeout(async () => {
            const profile = await authService.getUserProfile(session.user.id);
            setUserProfile(profile);
            setIsLoading(false);
          }, 0);
        } else {
          setUserProfile(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Load user profile for existing session
        setTimeout(async () => {
          const profile = await authService.getUserProfile(session.user.id);
          setUserProfile(profile);
          setIsLoading(false);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
    getUserDisplayName,
    isAuthenticated: !!user && !!session,
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


import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getUserDisplayName = () => {
    if (!user) return "Guest";
    
    // Try to get name from user metadata first
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    // Fall back to email (remove domain part for cleaner display)
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return "User";
  };

  return {
    user,
    isLoading,
    getUserDisplayName,
    isAuthenticated: !!user
  };
};

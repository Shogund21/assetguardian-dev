
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { validateEmailAccess, ValidationResult } from "@/services/emailValidationService";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userValidation, setUserValidation] = useState<ValidationResult | null>(null);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Validate user email if user exists
        if (user?.email) {
          const validation = await validateEmailAccess(user.email);
          setUserValidation(validation);
          
          // If user is not valid, sign them out
          if (!validation.isValid) {
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        
        if (sessionUser?.email) {
          const validation = await validateEmailAccess(sessionUser.email);
          setUserValidation(validation);
          
          // If user is not valid, sign them out
          if (!validation.isValid) {
            await supabase.auth.signOut();
            setUser(null);
            setUserValidation(null);
          }
        } else {
          setUserValidation(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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

  return {
    user,
    isLoading,
    getUserDisplayName,
    isAuthenticated: !!user && !!userValidation?.isValid,
    userValidation,
    isAdmin,
    isTechnician
  };
};

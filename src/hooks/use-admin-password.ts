
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAdminPassword = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };
    
    checkAuthStatus();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        setError("You must be logged in to set admin privileges.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to set admin privileges.",
        });
        return;
      }

      // SECURITY WARNING: Hardcoded password removed for security
      // Implement proper database-based authentication
      console.warn("SECURITY: Admin password authentication disabled - implement proper auth");
      
      setError("Admin authentication currently disabled for security. Please contact system administrator.");
      toast({
        variant: "destructive", 
        title: "Security Notice",
        description: "Admin authentication system is being updated for security. Contact administrator.",
      });
    } catch (error) {
      console.error("Error in admin password submission:", error);
      setError("An unexpected error occurred. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    password,
    setPassword,
    isLoading,
    isAdmin,
    error,
    isAuthenticated,
    handleSubmit,
  };
};

import { useEffect, useState } from "react";
import { supabase, ensureSession } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useAuthenticatedSupabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [hasValidJWT, setHasValidJWT] = useState(false);
  const { isAuthenticated, session } = useAuth();

  useEffect(() => {
    const checkAuthentication = async () => {
      console.log("🔄 Checking authentication status...");
      
      if (!isAuthenticated || !session) {
        console.log("🔓 No authentication, using client without JWT");
        setHasValidJWT(false);
        setIsReady(true);
        return;
      }

      try {
        // Ensure session is valid and JWT is available
        await ensureSession();
        setHasValidJWT(true);
        console.log("✅ Authentication validated, JWT ready");
      } catch (error) {
        console.error("❌ Authentication validation failed:", error);
        setHasValidJWT(false);
      }
      
      setIsReady(true);
    };

    checkAuthentication();
  }, [isAuthenticated, session]);

  return {
    supabase, // Always return the standard client
    isReady,
    hasValidJWT
  };
};
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
        console.log("🔓 No authentication, not ready");
        setHasValidJWT(false);
        setIsReady(false);
        return;
      }

      try {
        // Ensure session is valid and JWT is available
        await ensureSession();
        setHasValidJWT(true);
        setIsReady(true);
        console.log("✅ Authentication validated, JWT ready");
      } catch (error) {
        console.error("❌ Authentication validation failed:", error);
        setHasValidJWT(false);
        setIsReady(false);
      }
    };

    checkAuthentication();
  }, [isAuthenticated, session]);

  return {
    supabase, // Always return the standard client
    isReady,
    hasValidJWT
  };
};
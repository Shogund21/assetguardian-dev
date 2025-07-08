import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase, getAuthenticatedClient } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export const useAuthenticatedSupabase = () => {
  const [authClient, setAuthClient] = useState<SupabaseClient<Database>>(supabase);
  const [isReady, setIsReady] = useState(false);
  const [hasValidJWT, setHasValidJWT] = useState(false);

  useEffect(() => {
    const initializeAuthClient = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token && session?.user?.id) {
          console.log("🔐 Initializing authenticated Supabase client");
          try {
            const client = await getAuthenticatedClient();
            setAuthClient(client);
            setHasValidJWT(true);
            console.log("✅ Authenticated client ready with validated JWT");
          } catch (jwtError) {
            console.error("❌ JWT validation failed, using fallback:", jwtError);
            setAuthClient(supabase);
            setHasValidJWT(false);
          }
        } else {
          console.log("🔓 No valid session, using regular client");
          setAuthClient(supabase);
          setHasValidJWT(false);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error("❌ Failed to initialize authenticated client:", error);
        setAuthClient(supabase);
        setHasValidJWT(false);
        setIsReady(true);
      }
    };

    initializeAuthClient();

    // Listen for auth changes and update client accordingly
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state change:", event);
      
      if (event === 'SIGNED_IN' && session?.access_token && session?.user?.id) {
        try {
          console.log("🔐 Creating authenticated client for signed in user");
          const client = await getAuthenticatedClient();
          setAuthClient(client);
          setHasValidJWT(true);
          console.log("✅ Authenticated client updated with validated JWT");
        } catch (jwtError) {
          console.error("❌ Failed to create authenticated client:", jwtError);
          setAuthClient(supabase);
          setHasValidJWT(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("🔓 User signed out, using regular client");
        setAuthClient(supabase);
        setHasValidJWT(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        try {
          console.log("🔄 Token refreshed, updating client");
          const client = await getAuthenticatedClient();
          setAuthClient(client);
          setHasValidJWT(true);
        } catch (jwtError) {
          console.error("❌ Failed to update client after token refresh:", jwtError);
          setAuthClient(supabase);
          setHasValidJWT(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    supabase: authClient,
    isReady,
    hasValidJWT
  };
};
import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase, getAuthenticatedClient } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export const useAuthenticatedSupabase = () => {
  const [authClient, setAuthClient] = useState<SupabaseClient<Database>>(supabase);
  const [isReady, setIsReady] = useState(false);
  const [hasValidJWT, setHasValidJWT] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const initializeAuthClient = async () => {
      console.log("🔄 Initializing authenticated Supabase client...");
      
      try {
        // Wait a moment for auth to settle if this is the first load
        if (retryCount === 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting session for auth client:", error);
          setAuthClient(supabase);
          setHasValidJWT(false);
          setIsReady(true);
          return;
        }
        
        console.log("🔍 Session check for auth client:", {
          hasSession: !!session,
          hasToken: !!session?.access_token,
          hasUser: !!session?.user?.id,
          tokenLength: session?.access_token?.length
        });
        
        if (session?.access_token && session?.user?.id) {
          try {
            console.log("🔐 Creating authenticated client with JWT validation");
            const client = await getAuthenticatedClient();
            setAuthClient(client);
            setHasValidJWT(true);
            console.log("✅ Authenticated client ready with validated JWT");
          } catch (jwtError) {
            console.error("❌ JWT validation failed, using fallback client:", jwtError);
            setAuthClient(supabase);
            setHasValidJWT(false);
            
            // Retry once if JWT validation fails and we haven't retried yet
            if (retryCount < 1) {
              console.log("🔄 Retrying authenticated client initialization...");
              setRetryCount(prev => prev + 1);
              setTimeout(() => initializeAuthClient(), 500);
              return;
            }
          }
        } else {
          console.log("🔓 No valid session available, using regular client");
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
      console.log("🔄 Authenticated client auth state change:", event);
      
      // Reset retry count on new auth events
      setRetryCount(0);
      
      if (event === 'SIGNED_IN' && session?.access_token && session?.user?.id) {
        try {
          console.log("🔐 Creating authenticated client for signed in user");
          const client = await getAuthenticatedClient();
          setAuthClient(client);
          setHasValidJWT(true);
          console.log("✅ Authenticated client updated with validated JWT");
        } catch (jwtError) {
          console.error("❌ Failed to create authenticated client on sign in:", jwtError);
          setAuthClient(supabase);
          setHasValidJWT(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("🔓 User signed out, reverting to regular client");
        setAuthClient(supabase);
        setHasValidJWT(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        try {
          console.log("🔄 Token refreshed, updating authenticated client");
          const client = await getAuthenticatedClient();
          setAuthClient(client);
          setHasValidJWT(true);
          console.log("✅ Authenticated client updated after token refresh");
        } catch (jwtError) {
          console.error("❌ Failed to update client after token refresh:", jwtError);
          setAuthClient(supabase);
          setHasValidJWT(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [retryCount]);

  return {
    supabase: authClient,
    isReady,
    hasValidJWT
  };
};
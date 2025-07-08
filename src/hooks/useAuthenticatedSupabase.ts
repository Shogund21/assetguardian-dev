import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase, getAuthenticatedClient } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export const useAuthenticatedSupabase = () => {
  const [authClient, setAuthClient] = useState<SupabaseClient<Database>>(supabase);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeAuthClient = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          console.log("🔐 Creating authenticated Supabase client");
          const client = await getAuthenticatedClient();
          setAuthClient(client);
        } else {
          console.log("🔓 Using regular Supabase client (no auth)");
          setAuthClient(supabase);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize authenticated client:", error);
        setAuthClient(supabase);
        setIsReady(true);
      }
    };

    initializeAuthClient();

    // Listen for auth changes and update client accordingly
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        console.log("🔐 Auth state changed: creating authenticated client");
        const client = await getAuthenticatedClient();
        setAuthClient(client);
      } else if (event === 'SIGNED_OUT') {
        console.log("🔓 Auth state changed: using regular client");
        setAuthClient(supabase);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    supabase: authClient,
    isReady
  };
};
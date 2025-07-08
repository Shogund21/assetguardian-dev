import { useAuth } from "@/hooks/useAuth";
import { useAuthenticatedSupabase } from "@/hooks/useAuthenticatedSupabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const AuthDebugInfo = () => {
  const { user, session, isAuthenticated, authInitialized } = useAuth();
  const { hasValidJWT, isReady } = useAuthenticatedSupabase();

  const clearAuthState = async () => {
    console.log("🧹 Clearing authentication state...");
    
    // Clear all browser storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Reload the page to start fresh
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Authentication Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Auth Initialized:</span>
            <Badge variant={authInitialized ? "default" : "destructive"} className="ml-2">
              {authInitialized ? "Yes" : "No"}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Authenticated:</span>
            <Badge variant={isAuthenticated ? "default" : "destructive"} className="ml-2">
              {isAuthenticated ? "Yes" : "No"}
            </Badge>
          </div>
          <div>
            <span className="font-medium">User ID:</span>
            <span className="ml-2 text-sm font-mono">{user?.id || "None"}</span>
          </div>
          <div>
            <span className="font-medium">Has Session:</span>
            <Badge variant={!!session ? "default" : "destructive"} className="ml-2">
              {!!session ? "Yes" : "No"}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Has Access Token:</span>
            <Badge variant={!!session?.access_token ? "default" : "destructive"} className="ml-2">
              {!!session?.access_token ? "Yes" : "No"}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Token Length:</span>
            <span className="ml-2 text-sm">{session?.access_token?.length || 0}</span>
          </div>
          <div>
            <span className="font-medium">Client Ready:</span>
            <Badge variant={isReady ? "default" : "destructive"} className="ml-2">
              {isReady ? "Yes" : "No"}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Valid JWT:</span>
            <Badge variant={hasValidJWT ? "default" : "destructive"} className="ml-2">
              {hasValidJWT ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
        
        <div className="mt-4">
          <Button 
            onClick={clearAuthState}
            variant="outline"
            className="w-full"
          >
            🧹 Clear Auth State & Reload
          </Button>
        </div>
        
        {session?.access_token && (
          <div>
            <span className="font-medium">Token Preview:</span>
            <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
              {session.access_token.substring(0, 50)}...
            </div>
          </div>
        )}
        
        {user?.email && (
          <div>
            <span className="font-medium">Email:</span>
            <span className="ml-2">{user.email}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AuthTest = () => {
  const [authDebug, setAuthDebug] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testDatabaseAuth = async () => {
    setIsLoading(true);
    try {
      console.log("Testing database authentication...");
      
      // Test auth.uid() function
      const { data: authTest, error: authError } = await supabase.rpc('debug_auth_uid');
      
      // Test company_users query
      const { data: companyUsers, error: companyError } = await supabase
        .from('company_users')
        .select('*')
        .limit(1);
      
      // Test companies query
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .limit(1);
      
      setAuthDebug({
        authTest: { data: authTest, error: authError },
        companyUsers: { data: companyUsers, error: companyError },
        companies: { data: companies, error: companiesError },
        sessionInfo: {
          hasSession: !!supabase.auth.getSession(),
          timestamp: new Date().toISOString()
        }
      });
      
      console.log("Database auth test results:", {
        authTest,
        authError,
        companyUsers,
        companyError,
        companies,
        companiesError
      });
      
    } catch (error) {
      console.error("Auth test failed:", error);
      setAuthDebug({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Database Authentication Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testDatabaseAuth} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Database Auth"}
        </Button>
        
        {authDebug && (
          <div className="bg-gray-100 p-4 rounded text-xs">
            <pre>{JSON.stringify(authDebug, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
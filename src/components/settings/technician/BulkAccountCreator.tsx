import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateAccountsResult {
  success: boolean;
  results: {
    created: number;
    skipped: number;
    errors: Array<{ email: string; error: string }>;
    details: Array<{ email: string; status: string; message: string }>;
  };
}

const BulkAccountCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<CreateAccountsResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const handleBulkCreate = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsCreating(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("create-technician-accounts");

      if (error) {
        throw error;
      }

      setResults(data as CreateAccountsResult);
      
      if (data.success) {
        toast({
          title: "Bulk Account Creation Completed",
          description: `Created ${data.results.created} accounts, skipped ${data.results.skipped}`,
        });
      } else {
        toast({
          title: "Bulk Account Creation Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Error creating bulk accounts:", error);
      toast({
        title: "Error",
        description: "Failed to create technician accounts: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      setShowConfirmation(false);
    }
  };

  const resetResults = () => {
    setResults(null);
    setShowConfirmation(false);
  };

  if (results) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Bulk Account Creation Results
          </CardTitle>
          <CardDescription>
            Summary of technician account creation process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{results.results.created}</div>
              <div className="text-sm text-green-600">Accounts Created</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{results.results.skipped}</div>
              <div className="text-sm text-yellow-600">Already Existed</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{results.results.errors.length}</div>
              <div className="text-sm text-red-600">Errors</div>
            </div>
          </div>

          {results.results.details.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="font-medium">Detailed Results:</h4>
              {results.results.details.map((detail, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <span>{detail.email}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      detail.status === 'created' ? 'default' : 
                      detail.status === 'skipped' ? 'secondary' : 'destructive'
                    }>
                      {detail.status}
                    </Badge>
                    <span className="text-xs text-gray-600">{detail.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button onClick={resetResults} variant="outline" className="w-full">
            Close Results
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Account Creation for Technicians
        </CardTitle>
        <CardDescription>
          Create login accounts for all active technicians with default password "Macy1234"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showConfirmation ? (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will create Supabase authentication accounts for all active technicians who don't already have accounts.
                Default password will be "Macy1234" which they can change later.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleBulkCreate} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Accounts...
                </>
              ) : (
                "Create Accounts for Active Technicians"
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Confirm Bulk Account Creation</strong><br />
                This will create login accounts for all active technicians. Each account will have:
                <ul className="mt-2 ml-4 list-disc">
                  <li>Email as username (their existing email)</li>
                  <li>Password: "Macy1234"</li>
                  <li>Email confirmation automatically enabled</li>
                  <li>Linked to their existing technician record</li>
                </ul>
                Are you sure you want to proceed?
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleBulkCreate} 
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Yes, Create All Accounts"
                )}
              </Button>
              <Button 
                onClick={() => setShowConfirmation(false)} 
                variant="outline"
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkAccountCreator;
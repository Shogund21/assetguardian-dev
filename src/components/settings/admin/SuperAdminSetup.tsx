import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SetupResult {
  success: boolean;
  message: string;
  user_id?: string;
}

const SuperAdminSetup = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [result, setResult] = useState<SetupResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [superAdminExists, setSuperAdminExists] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check if super admin account already exists
  useEffect(() => {
    const checkSuperAdminExists = async () => {
      try {
        const { data, error } = await supabase.rpc('super_admin_exists');
        if (error) {
          console.error('Error checking super admin:', error);
          setSuperAdminExists(false);
        } else {
          setSuperAdminExists(data || false);
        }
      } catch (error) {
        console.error('Error checking super admin:', error);
        setSuperAdminExists(false);
      }
    };

    checkSuperAdminExists();
  }, []);

  // Don't render if super admin already exists
  if (superAdminExists === true) {
    return null;
  }

  // Show loading state while checking
  if (superAdminExists === null) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Checking setup status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSetupSuperAdmin = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsSettingUp(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("setup-super-admin");

      if (error) {
        throw error;
      }

      setResult(data as SetupResult);
      
      if (data.success) {
        setSetupComplete(true);
        setSuperAdminExists(true); // Update state so component hides
        toast({
          title: "Super Admin Setup Complete",
          description: "Super admin account has been created successfully",
        });
      } else {
        toast({
          title: "Setup Failed",
          description: data.message || "Failed to create super admin account",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Error setting up super admin:", error);
      toast({
        title: "Error",
        description: "Failed to set up super admin account: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSettingUp(false);
      setShowConfirmation(false);
    }
  };

  const resetSetup = () => {
    setResult(null);
    setSetupComplete(false);
    setShowConfirmation(false);
  };

  if (setupComplete && result?.success) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Super Admin Setup Complete
          </CardTitle>
          <CardDescription className="text-green-700">
            The super admin account has been successfully created
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-100 rounded-lg">
            <div className="text-sm text-green-800">
              <strong>Email:</strong> edward@shogunaillc.com<br />
              <strong>Password:</strong> Shatzee21$<br />
              <strong>Status:</strong> <Badge variant="default" className="bg-green-600 text-white">Active</Badge>
            </div>
          </div>
          
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              The super admin account is now ready for use. You can log in with the credentials above.
              This setup option will no longer be available.
            </AlertDescription>
          </Alert>

          <Button onClick={resetSetup} variant="outline" className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Super Admin Account Setup
        </CardTitle>
        <CardDescription>
          Create the super admin account for edward@shogunaillc.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showConfirmation ? (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will create a Supabase authentication account for the super admin user.
                <br />
                <strong>Email:</strong> edward@shogunaillc.com
                <br />
                <strong>Password:</strong> Shatzee21$
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleSetupSuperAdmin} 
              disabled={isSettingUp}
              className="w-full"
            >
              {isSettingUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Setup Super Admin Account"
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Confirm Super Admin Setup</strong><br />
                This will create a super admin account with the following details:
                <ul className="mt-2 ml-4 list-disc">
                  <li>Email: edward@shogunaillc.com</li>
                  <li>Password: Shatzee21$</li>
                  <li>Full system administration privileges</li>
                  <li>Email will be automatically confirmed</li>
                </ul>
                Are you sure you want to proceed?
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSetupSuperAdmin} 
                disabled={isSettingUp}
                className="flex-1"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Yes, Create Super Admin"
                )}
              </Button>
              <Button 
                onClick={() => setShowConfirmation(false)} 
                variant="outline"
                disabled={isSettingUp}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {result && !result.success && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Setup Failed:</strong> {result.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SuperAdminSetup;
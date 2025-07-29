import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle } from "lucide-react";

interface SecureAdminAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const SecureAdminAuth = ({ onSuccess, onCancel }: SecureAdminAuthProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in first to access admin features.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use database function to verify admin credentials securely
      const { data, error } = await supabase.rpc('verify_admin_access', {
        user_email: user.email,
        provided_password: password
      });

      if (error) throw error;

      if (data?.is_valid) {
        // Set admin flag in admin_users table
        const { error: adminError } = await supabase
          .from('admin_users')
          .upsert({ 
            id: user.id,
            is_admin: true 
          });

        if (adminError) throw adminError;

        toast({
          title: "Access Granted",
          description: "Admin privileges activated.",
        });
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Invalid admin credentials.",
        });
      }
    } catch (error) {
      console.error("Admin auth error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Failed to verify admin credentials.",
      });
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in to access admin features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Admin Authentication</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={isLoading || !password.trim()}
            className="flex-1"
          >
            {isLoading ? "Verifying..." : "Authenticate"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
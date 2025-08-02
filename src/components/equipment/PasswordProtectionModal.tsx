
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PasswordProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordProtectionModal = ({
  isOpen,
  onClose,
  onSuccess,
}: PasswordProtectionModalProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "Please enter your password.",
      });
      return;
    }

    if (!user?.email) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "User email not found. Please sign in again.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('verify_admin_access', {
        user_email: user.email,
        provided_password: password
      });

      if (error) {
        console.error('Admin verification error:', error);
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Unable to verify credentials. Please try again.",
        });
        setPassword("");
        return;
      }

      if ((data as { is_valid: boolean })?.is_valid) {
        toast({
          title: "Access Granted",
          description: "Welcome to Technician Management.",
        });
        setPassword("");
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Credentials",
          description: "The password you entered is incorrect.",
        });
        setPassword("");
      }
    } catch (error) {
      console.error('Unexpected error during admin verification:', error);
      toast({
        variant: "destructive",
        title: "System Error",
        description: "An unexpected error occurred. Please try again.",
      });
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="bg-[#1EAEDB] hover:bg-[#33C3F0] text-black disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordProtectionModal;

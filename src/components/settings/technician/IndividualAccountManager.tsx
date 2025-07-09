import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserX, RotateCcw, Loader2 } from "lucide-react";
import { Technician } from "@/types/technician";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface IndividualAccountManagerProps {
  technician: Technician;
}

const IndividualAccountManager = ({ technician }: IndividualAccountManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAccount = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-technician-accounts", {
        body: { 
          technicianIds: [technician.id],
          single: true 
        }
      });

      if (error) throw error;

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["technicians"] });
        toast({
          title: "Account Created",
          description: `Login account created for ${technician.firstName} ${technician.lastName}`,
        });
      } else {
        throw new Error(data.error || "Failed to create account");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create account: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetPassword = async () => {
    setIsResetting(true);
    try {
      // Call password reset function for the technician
      const { error } = await supabase.auth.resetPasswordForEmail(technician.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;

      toast({
        title: "Password Reset Sent",
        description: `Password reset email sent to ${technician.email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send password reset: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const toggleAccountStatus = async () => {
    setIsToggling(true);
    try {
      const newStatus = technician.account_status === 'has_account' ? 'account_disabled' : 'has_account';
      const userEnabled = newStatus === 'has_account';
      
      const { error } = await supabase.rpc('set_technician_status', {
        p_technician_id: technician.id,
        p_new_status: technician.status,
        p_account_status: newStatus,
        p_user_enabled: userEnabled
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Account Status Updated",
        description: `Account ${newStatus === 'has_account' ? 'enabled' : 'disabled'} for ${technician.firstName} ${technician.lastName}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update account status: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const getAccountStatusBadge = () => {
    switch (technician.account_status) {
      case 'has_account':
        return <Badge variant="default">Has Account</Badge>;
      case 'account_disabled':
        return <Badge variant="secondary">Account Disabled</Badge>;
      default:
        return <Badge variant="outline">No Account</Badge>;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {getAccountStatusBadge()}
      
      <div className="flex flex-wrap gap-1">
        {technician.account_status === 'no_account' && (
          <Button
            size="sm"
            variant="outline"
            onClick={createAccount}
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <UserPlus className="h-3 w-3" />
            )}
          </Button>
        )}

        {technician.account_status === 'has_account' && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={resetPassword}
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleAccountStatus}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <UserX className="h-3 w-3" />
              )}
            </Button>
          </>
        )}

        {technician.account_status === 'account_disabled' && (
          <Button
            size="sm"
            variant="outline"
            onClick={toggleAccountStatus}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <UserPlus className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default IndividualAccountManager;
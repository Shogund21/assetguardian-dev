
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const LogoutButton = ({ className, children }: LogoutButtonProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
        navigate("/auth");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to sign out",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant="ghost" 
      className={className}
    >
      {children || "Sign Out"}
    </Button>
  );
};

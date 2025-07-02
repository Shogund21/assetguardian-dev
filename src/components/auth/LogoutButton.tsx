
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/services/emailValidationService";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const LogoutButton = ({ className, children }: LogoutButtonProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser(); // Now supports async for audit logging
    navigate("/");
    // Force a page reload to clear any cached state
    window.location.reload();
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

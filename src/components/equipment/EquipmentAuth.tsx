
import { useAuth } from "@/hooks/useAuth";

interface EquipmentAuthProps {
  children: React.ReactNode;
}

export const EquipmentAuth = ({ children }: EquipmentAuthProps) => {
  const { isAdmin, hasFullAccess, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  // Admin users and users with full access bypass any restrictions
  if (isAdmin() || hasFullAccess()) {
    return <>{children}</>;
  }

  // For non-admin users, you could add additional checks here if needed
  // For now, we'll allow access for all authenticated users
  return <>{children}</>;
};

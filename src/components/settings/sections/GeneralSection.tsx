
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TechnicianManagement from "../TechnicianManagement";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import PasswordProtectionModal from "@/components/equipment/PasswordProtectionModal";
import { AuditDashboard } from "@/components/audit/AuditDashboard";
import { useAuth } from "@/hooks/useAuth";

export const GeneralSection = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isAdmin } = useAuth();

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setIsPasswordModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Technician Management</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Add, remove, and manage technicians in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <TechnicianManagement />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Lock className="h-12 w-12 text-gray-400" />
              <p className="text-center text-muted-foreground">
                This section is password protected. Please authenticate to access technician management.
              </p>
              <Button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-[#1EAEDB] hover:bg-[#33C3F0] text-black"
              >
                Unlock Access
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">SOC 2 Audit Dashboard</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Monitor user activity, access logs, and security events for compliance reporting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuditDashboard />
          </CardContent>
        </Card>
      )}

      <PasswordProtectionModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

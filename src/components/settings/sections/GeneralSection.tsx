
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
            <div className="flex flex-col items-center justify-center space-y-6 py-10">
              <Lock className="h-16 w-16 text-gray-400" />
              <div className="text-center space-y-3 max-w-md">
                <h3 className="text-lg font-semibold text-gray-900">Admin Access Required</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Please enter your admin credentials to manage technicians and access sensitive settings. 
                  This helps ensure only authorized personnel can modify critical system configurations.
                </p>
                <p className="text-sm text-gray-500">
                  Contact your system administrator if you need access.
                </p>
              </div>
              <Button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
              >
                <Lock className="h-4 w-4 mr-2" />
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

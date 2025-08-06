
import { useEffect, useState } from "react";
import { MaintenanceCheck, MaintenanceLocation } from "@/types/maintenance";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MaintenanceTableRow from "./table/MaintenanceTableRow";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";
import { useAuth } from "@/hooks/useAuth";
import { useAuthenticatedSupabase } from "@/hooks/useAuthenticatedSupabase";
import PasswordProtectionModal from "@/components/equipment/PasswordProtectionModal";

const MaintenanceHistory = () => {
  const [maintenanceChecks, setMaintenanceChecks] = useState<MaintenanceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { applyCompanyFilter } = useCompanyFilter();
  const { user, isAuthenticated, userProfile, isAdmin, session } = useAuth();
  const { supabase: authenticatedSupabase, isReady, hasValidJWT } = useAuthenticatedSupabase();

  // Check if user is admin or super admin
  const isAdminUser = isAdmin() || userProfile?.email === "edward@shogunaillc.com";

  const fetchMaintenanceChecks = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      console.log("Fetching maintenance checks...");
      console.log("Auth state:", { isAuthenticated, isReady, hasValidJWT, userId: user?.id, sessionExists: !!session });
      
      if (!isAuthenticated || !isReady || !hasValidJWT) {
        console.log('MaintenanceHistory: User not properly authenticated or JWT not ready');
        setFetchError("Authentication required. Please log in to view maintenance checks.");
        return;
      }
      
      // Use direct table queries with JOINs instead of RPC function
      const { data, error } = await authenticatedSupabase
        .from('hvac_maintenance_checks')
        .select(`
          *,
          equipment:equipment(
            id,
            name,
            type,
            model,
            serial_number,
            location,
            status,
            company_id
          ),
          technician:technicians!technician_id(
            id,
            firstName,
            lastName,
            email,
            phone,
            specialization
          ),
          location:locations!location_id(
            id,
            name,
            store_number
          )
        `)
        .order('check_date', { ascending: false })
        .limit(500);

      if (error) {
        console.error("Error fetching maintenance checks:", error);
        setFetchError(`Failed to fetch maintenance checks: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.log("No maintenance checks found");
        setMaintenanceChecks([]);
        return;
      }

      console.log("Raw maintenance data:", data);

      // Transform the data from direct table queries
      const transformedData: MaintenanceCheck[] = data.map((item: any) => {
        console.log("Processing maintenance check item:", item);
        
        const check: MaintenanceCheck = {
          id: item.id,
          equipment_id: item.equipment_id,
          technician_id: item.technician_id,
          check_date: item.check_date,
          status: item.status || 'pending',
          equipment_type: item.equipment_type,
          notes: item.notes,
          // Equipment details from JOIN - matching MaintenanceCheck interface
          equipment: item.equipment ? {
            name: item.equipment.name,
            location: item.equipment.location,
            type: item.equipment.type
          } : undefined,
          // Technician details from JOIN - matching MaintenanceCheck interface
          technician: item.technician ? {
            firstName: item.technician.firstName,
            lastName: item.technician.lastName
          } : undefined,
          // Location details from JOIN
          selectedLocation: item.location ? {
            id: item.location.id,
            name: item.location.name,
            store_number: item.location.store_number,
            company_id: item.company_id
          } : undefined,
          // Additional maintenance check fields
          air_filter_status: item.air_filter_status,
          belt_condition: item.belt_condition,
          motor_condition: item.motor_condition,
          control_system_status: item.control_system_status,
          maintenance_frequency: item.maintenance_frequency,
          // Add other fields as needed
          company_id: item.company_id,
          location_id: item.location_id,
          created_at: item.created_at,
          updated_at: item.updated_at
        };

        console.log("Transformed maintenance check:", check);
        return check;
      });

      console.log("Final transformed maintenance checks:", transformedData);
      setMaintenanceChecks(transformedData);

    } catch (error) {
      console.error("Error in fetchMaintenanceChecks:", error);
      toast({
        title: "Error fetching maintenance checks",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "completed" | "pending" | "issue_found"
  ) => {
    try {
      const { error } = await supabase
        .from("hvac_maintenance_checks")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Maintenance check status has been updated successfully.",
      });

      fetchMaintenanceChecks();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error updating status",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdminUser) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete maintenance records.",
        variant: "destructive",
      });
      return;
    }
    
    // Admin users can delete directly without password protection
    try {
      const { error } = await supabase
        .from("hvac_maintenance_checks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance check deleted successfully.",
      });

      fetchMaintenanceChecks();
    } catch (error) {
      console.error("Error deleting maintenance check:", error);
      toast({
        title: "Error deleting maintenance check",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSuccess = async () => {
    if (!selectedCheckId) return;

    try {
      const { error } = await supabase
        .from("hvac_maintenance_checks")
        .delete()
        .eq("id", selectedCheckId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance check deleted successfully.",
      });

      fetchMaintenanceChecks();
    } catch (error) {
      console.error("Error deleting maintenance check:", error);
      toast({
        title: "Error deleting maintenance check",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordModalOpen(false);
      setSelectedCheckId(null);
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated and JWT is ready
    if (isAuthenticated && isReady && hasValidJWT) {
      fetchMaintenanceChecks();
    }
  }, [isAuthenticated, isReady, hasValidJWT]);

  return (
    <div className="h-full flex flex-col space-y-4">
      <h2 className={`text-xl ${isMobile ? 'text-center' : 'text-2xl'} font-bold`}>
        Maintenance History
      </h2>
      
      {fetchError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          Error loading data: {fetchError}
        </div>
      )}
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-4 pr-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))
          ) : maintenanceChecks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No maintenance checks found.</p>
          ) : (
            maintenanceChecks.map((check) => (
              <MaintenanceTableRow
                key={check.id}
                check={check}
                onStatusChange={handleStatusChange}
                onDelete={isAdminUser ? handleDelete : undefined}
              />
            ))
          )}
        </div>
      </div>

      <PasswordProtectionModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setSelectedCheckId(null);
        }}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
};

export default MaintenanceHistory;

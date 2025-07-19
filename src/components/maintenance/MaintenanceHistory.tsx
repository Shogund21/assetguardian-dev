
import { useEffect, useState } from "react";
import { MaintenanceCheck, MaintenanceLocation } from "@/types/maintenance";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MaintenanceTableRow from "./table/MaintenanceTableRow";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";
import { useAuth } from "@/hooks/useAuth";

const MaintenanceHistory = () => {
  const [maintenanceChecks, setMaintenanceChecks] = useState<MaintenanceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { applyCompanyFilter } = useCompanyFilter();
  const { user, isAuthenticated } = useAuth();

  const fetchMaintenanceChecks = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      console.log("Fetching maintenance checks...");
      
      if (!isAuthenticated) {
        console.log('MaintenanceHistory: User not authenticated');
        return;
      }
      
      // Use the new RPC function for better security and performance
      const { data, error } = await supabase.rpc('get_maintenance_history', {
        p_equipment_id: null,
        p_limit: 500,
        p_offset: 0
      });

      if (error) {
        console.error("Error fetching maintenance checks:", error);
        setFetchError(error.message);
        throw error;
      }

      console.log("Fetched maintenance data via RPC:", data);

      // Transform the RPC data to match MaintenanceCheck interface
      // Preserve ALL fields from the maintenance check record
      const processedData = (data || []).map(check => ({
        // Spread all fields from the check to preserve equipment-specific data
        ...check,
        // Override specific fields that need transformation
        id: check.id,
        equipment_id: check.equipment_id,
        technician_id: check.technician_id,
        check_date: check.check_date,
        status: check.status,
        notes: check.notes,
        company_id: check.company_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        equipment: {
          name: check.equipment_name || '',
          location: check.equipment_location || '',
          type: check.equipment_type
        },
        technician: {
          firstName: check.technician_name?.split(' ')[0] || '',
          lastName: check.technician_name?.split(' ').slice(1).join(' ') || ''
        },
        // All equipment-specific fields are now properly returned from the RPC function
      })) as MaintenanceCheck[];
      
      setMaintenanceChecks(processedData);
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

  useEffect(() => {
    // Only fetch if user is authenticated to avoid premature calls
    if (isAuthenticated) {
      fetchMaintenanceChecks();
    }
  }, [isAuthenticated]);

  return (
    <div className="space-y-4">
      <h2 className={`text-xl ${isMobile ? 'text-center' : 'text-2xl'} font-bold`}>
        Maintenance History
      </h2>
      
      {fetchError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          Error loading data: {fetchError}
        </div>
      )}
      
      <div className="space-y-4">
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
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceHistory;

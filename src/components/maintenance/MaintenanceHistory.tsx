
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
      
      // Check if user is super admin
      const isSuperAdmin = user?.email === 'edward@shogunaillc.com';
      
      // First query to get maintenance checks with equipment and technician details
      let query = supabase
        .from("hvac_maintenance_checks")
        .select(`
          *,
          equipment:equipment_id (
            name,
            location
          ),
          technician:technician_id (
            firstName,
            lastName
          )
        `);
      
      // Apply company filtering only for non-super admin users
      if (!isSuperAdmin) {
        query = applyCompanyFilter(query);
      }
      
      const { data, error } = await query.order("check_date", { ascending: false });

      if (error) {
        console.error("Error fetching maintenance checks:", error);
        setFetchError(error.message);
        throw error;
      }

      console.log("Fetched maintenance data:", data);

      // If we have location_ids, fetch the location data separately
      if (data && data.length > 0) {
        // Get unique location IDs that are not null
        const locationIds = [...new Set(data.filter(check => check.location_id).map(check => check.location_id))];
        
        if (locationIds.length > 0) {
          const { data: locationsData, error: locationsError } = await supabase
            .from("locations")
            .select("id, name, store_number")
            .in("id", locationIds);
            
          if (locationsError) {
            console.error("Error fetching locations:", locationsError);
            // Continue with the process, we'll just use equipment locations as fallback
          } else if (locationsData) {
            // Create a map of location data for quick lookup
            const locationMap = locationsData.reduce((acc, location) => {
              acc[location.id] = {
                name: location.name,
                store_number: location.store_number
              };
              return acc;
            }, {} as Record<string, MaintenanceLocation>);
            
            // Enrich maintenance checks with properly structured location data
            const enrichedData = data.map(check => {
              const result: MaintenanceCheck = {
                ...check,
                // Ensure required elevator fields are present with default values
                unusual_noise_elevator: check.unusual_noise_elevator ?? false,
                vibration_elevator: check.vibration_elevator ?? false,
              };
              
              if (check.location_id && locationMap[check.location_id]) {
                const locationData = locationMap[check.location_id];
                result.location = {
                  name: locationData.name || "",
                  store_number: locationData.store_number
                };
              }
              
              return result;
            });
            
            console.log("Enriched maintenance checks with locations:", enrichedData);
            setMaintenanceChecks(enrichedData);
            setLoading(false);
            return;
          }
        }
      }
      
      // If we didn't have any location_ids or the location fetching failed
      console.log("Maintenance checks without location enrichment:", data);
      const processedData = (data || []).map(check => ({
        ...check,
        // Ensure required elevator fields are present with default values
        unusual_noise_elevator: check.unusual_noise_elevator ?? false,
        vibration_elevator: check.vibration_elevator ?? false,
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
    fetchMaintenanceChecks();
  }, []);

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

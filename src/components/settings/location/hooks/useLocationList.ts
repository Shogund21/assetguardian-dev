
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LocationData } from "../schemas/locationSchema";
import { useCompany } from "@/contexts/CompanyContext";

export const useLocationList = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editLocation, setEditLocation] = useState<LocationData | null>(null);
  const { currentCompany } = useCompany();

  console.log('useLocationList context:', { 
    currentCompanyId: currentCompany?.id
  });

  const { data: locations, refetch, isLoading } = useQuery({
    queryKey: ["locations", currentCompany?.id],
    queryFn: async () => {
      console.log('Fetching locations with company filter:', currentCompany?.id);
      
      try {
        // Start with the base query
        let query = supabase.from("locations").select("*");
        
        // If we have a company ID, include both company locations and unassigned locations
        if (currentCompany?.id) {
          query = query.or(`company_id.eq.${currentCompany.id},company_id.is.null`);
        }
        
        // Order by creation date
        query = query.order("created_at", { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching locations:", error);
          throw error;
        }
        
        console.log('Fetched locations:', data?.length || 0);
        return data || [];
      } catch (error: any) {
        console.error("Error in location query:", error);
        toast({
          variant: "destructive",
          title: "Error fetching locations",
          description: error.message || "Failed to fetch locations. Please try again.",
        });
        return [];
      }
    },
    // Enable the query when we have auth (RLS requires auth)
    enabled: true,
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) {
        console.error("Delete error:", error);
        throw error;
      }
      toast({ title: "Success", description: "Location deleted successfully" });
      await refetch();
    } catch (error: any) {
      console.error("Error deleting location:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete location. Please try again.",
      });
    }
  };

  const handleEdit = (location: LocationData) => {
    console.log("Editing location:", location);
    setEditLocation(location);
    setIsDialogOpen(true);
  };

  const handleSuccess = async () => {
    console.log("Success callback triggered, refetching data");
    try {
      await refetch();
      setIsDialogOpen(false);
      setEditLocation(null);
    } catch (error) {
      console.error("Error refetching data after success:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh data. Please try again.",
      });
    }
  };

  const openAddDialog = () => {
    setEditLocation(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditLocation(null);
    refetch();
  };

  return {
    locations,
    isLoading,
    isDialogOpen,
    editLocation,
    setIsDialogOpen,
    handleDelete,
    handleEdit,
    handleSuccess,
    openAddDialog,
    closeDialog,
    refetch,
    currentCompany
  };
};


import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LocationFormValues, LocationData } from "../schemas/locationSchema";
import { useCompany } from "@/contexts/CompanyContext";
import { PostgrestError } from "@supabase/supabase-js";

export const useLocationForm = (
  form: UseFormReturn<LocationFormValues>,
  initialData?: LocationData,
  onSuccess?: () => void
) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { currentCompany } = useCompany();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session && !error);
    };
    
    checkAuth();
  }, []);

  // Parse Supabase error messages into user-friendly format
  const parseSupabaseError = (error: PostgrestError): string => {
    // Handle duplicate store number error (constraint violation)
    if (error.code === "23505" && error.message.includes("unique_store_number_per_company")) {
      return "Store number already exists for this company.";
    }
    
    // Handle permission errors
    if (error.code === "42501" || error.message.includes("permission denied")) {
      return "You don't have permission to perform this action.";
    }
    
    // Return the original error message for other cases
    return error.message || "An unexpected error occurred.";
  };

  const onSubmit = async (values: LocationFormValues) => {
    try {
      // Verify authentication
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({ 
          variant: "destructive", 
          title: "Authentication Required", 
          description: "You must be logged in to save locations."
        });
        return;
      }

      setIsSubmitting(true);
      console.log("Submitting location with values:", values);
      
      // Use the store_number as the name if name is empty or just whitespace
      const locationName = values.name?.trim() || values.store_number;
      
      // Get the company_id from initialData, context, or use null
      const company_id = initialData?.company_id || currentCompany?.id || null;
      
      const locationData = {
        store_number: values.store_number,
        name: locationName,
        is_active: values.is_active,
        company_id
      };

      console.log("Prepared location data:", locationData);
      
      if (initialData?.id) {
        console.log("Updating location with ID:", initialData.id);
        const { error } = await supabase
          .from("locations")
          .update({
            ...locationData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (error) {
          console.error("Error updating location:", error);
          throw error;
        }
        
        console.log("Location updated successfully!");
        toast({ title: "Success", description: "Location updated successfully" });
      } else {
        console.log("Creating new location with data:", locationData);
        const { error } = await supabase
          .from("locations")
          .insert(locationData);

        if (error) {
          console.error("Error creating location:", error);
          throw error;
        }
        
        console.log("Location added successfully!");
        toast({ title: "Success", description: "Location added successfully" });
      }

      // Reset the form if it's a new location
      if (!initialData) {
        form.reset({
          store_number: "",
          name: "",
          is_active: true
        });
      }
      
      // Explicitly call onSuccess callback to trigger immediate data refresh
      if (onSuccess) {
        console.log("Calling onSuccess callback to refresh data");
        await onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving location:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.code ? parseSupabaseError(error) : error.message || "Failed to save location. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    isAuthenticated,
    onSubmit
  };
};

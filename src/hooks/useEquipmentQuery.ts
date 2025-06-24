
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Equipment } from "@/types/equipment";

export const useEquipmentQuery = (locationId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['equipment', locationId],
    queryFn: async () => {
      if (!locationId) {
        console.log('No location ID provided');
        return [];
      }

      console.log('Fetching all equipment, selected location:', locationId);

      try {
        // Get location data first (still useful for logging purposes)
        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .select('*')
          .eq('id', locationId)
          .maybeSingle();
        
        if (locationError) {
          console.error('Location fetch error:', locationError);
          toast({
            title: "Error loading location data",
            description: locationError.message,
            variant: "destructive",
          });
          throw locationError;
        }

        if (!locationData) {
          console.error(`Location ID ${locationId} not found in database`);
          toast({
            title: "Location not found",
            description: `The selected location (ID: ${locationId}) could not be found.`,
            variant: "destructive",
          });
          return [];
        }

        console.log('Location data retrieved successfully:', locationData);

        // Fetch all equipment - NO FILTERING BY LOCATION
        const { data: equipment, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, name, model, serial_number, location, status, company_id, created_at, updated_at')
          .order('name');
        
        if (equipmentError) {
          console.error('Equipment fetch error:', equipmentError);
          toast({
            title: "Error loading equipment",
            description: equipmentError.message,
            variant: "destructive",
          });
          throw equipmentError;
        }

        if (!equipment || equipment.length === 0) {
          console.log('No equipment found in database');
          return [];
        }

        console.log(`Retrieved ${equipment.length} equipment items`);
        
        // Mark special equipment types but return ALL equipment
        const processedEquipment = equipment.map(e => {
          // Store original location for reference but don't restrict selection
          const isRestroom = e.name.toLowerCase().includes('restroom');
          const isElevator = e.name.toLowerCase().includes('elevator');
          
          // Add internal tracking properties but don't display warnings
          const equipmentWithMeta: Equipment = {
            ...e,
            // Ensure status field exists
            status: e.status || 'Active',
            // Ensure type field exists  
            type: 'General',
            isSpecialLocation: isRestroom || isElevator,
            originalLocationId: e.location,
            displayWarning: false // Never show warnings
          };
          
          if (isRestroom || isElevator) {
            console.log(`Special equipment "${e.name}" has database location "${e.location}" but will be available for all locations`);
          }
          
          return equipmentWithMeta;
        });

        console.log(`Returning all ${processedEquipment.length} equipment items for location ${locationData.name}`);
        return processedEquipment;
      } catch (error) {
        console.error('Error in useEquipmentQuery:', error);
        toast({
          title: "Error fetching equipment",
          description: error instanceof Error ? error.message : "An unknown error occurred while loading equipment",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!locationId,
    // Don't refetch unnecessarily - this helps prevent UI flickering
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once to avoid endless error loops
    meta: {
      onError: (error: Error) => {
        console.error('Equipment query error:', error);
        toast({
          title: "Error loading equipment",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });
};

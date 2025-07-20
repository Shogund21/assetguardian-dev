
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { MaintenanceCheck } from "@/types/maintenance";
import { MaintenanceFormValues } from "./schema/maintenanceFormSchema";
import { detectEquipmentType, isValidEquipmentType } from "./utils/equipmentTypeDetection";
import { mapMaintenanceData } from "./services/maintenanceDataMapper";
import { maintenanceDbService } from "./services/maintenanceDbService";

/**
 * Hook for handling maintenance form submission
 */
export const useMaintenanceFormSubmit = (
  onComplete: () => void,
  initialData?: MaintenanceCheck,
  onFilterPromptNeeded?: (equipmentId: string, equipmentName: string, maintenanceData: any) => boolean
) => {
  const { toast } = useToast();
  const { userProfile, isAuthenticated, session } = useAuth();

  /**
   * Handle form submission
   */
  const handleSubmit = async (values: MaintenanceFormValues) => {
    try {
      // Log complete form values for debugging
      console.log('Submitting form with values:', JSON.stringify(values, null, 2));
      console.log('Update mode:', !!initialData);
      console.log('Location ID in form values:', values.location_id);
      
      // CRITICAL FIX: Verify authentication first
      if (!isAuthenticated || !session || !userProfile) {
        console.error('User not authenticated or missing profile');
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to submit maintenance checks.",
        });
        throw new Error('Authentication required');
      }

      // CRITICAL FIX: Verify user has company_id
      if (!userProfile.company_id) {
        console.error('User profile missing company_id:', userProfile);
        toast({
          variant: "destructive",
          title: "Company Association Required",
          description: "Your account must be associated with a company to submit maintenance checks.",
        });
        throw new Error('Company association required');
      }

      console.log('Authentication verified:', {
        userId: userProfile.id,
        email: userProfile.email,
        companyId: userProfile.company_id,
        companyName: userProfile.company_name
      });

      // CRITICAL FIX: Create a stable deep copy of the form values to prevent any reference issues
      const formValues = JSON.parse(JSON.stringify(values));
      
      // IMPORTANT: Validate location is present
      if (!formValues.location_id) {
        console.error('No location_id provided in form values');
        toast({
          variant: "destructive",
          title: "Missing Location",
          description: "Please select a location before submitting.",
        });
        throw new Error('Location is required');
      }
      
      // Store the original location_id for verification later
      const originalLocationId = formValues.location_id;
      console.log('Original selected location_id:', originalLocationId);
      
      // Validate that equipment is selected
      if (!formValues.equipment_id) {
        console.error('No equipment_id provided in form values');
        toast({
          variant: "destructive",
          title: "Missing Equipment",
          description: "Please select equipment before submitting.",
        });
        throw new Error('Equipment is required');
      }
      
      // Validate that technician is selected
      if (!formValues.technician_id) {
        console.error('No technician_id provided in form values');
        toast({
          variant: "destructive",
          title: "Missing Technician",
          description: "Please select a technician before submitting.",
        });
        throw new Error('Technician is required');
      }
      
      // Get equipment details to determine type
      const equipment = await maintenanceDbService.getEquipment(formValues.equipment_id);
      console.log('Retrieved equipment details:', equipment);
      
      if (!equipment) {
        console.error('Equipment not found with ID:', formValues.equipment_id);
        toast({
          variant: "destructive",
          title: "Equipment Not Found",
          description: "The selected equipment could not be found. Please try again.",
        });
        throw new Error('Equipment not found');
      }
      
      // Log equipment's stored location vs user-selected location
      console.log('Equipment database location:', equipment.location);
      console.log('User-selected location ID:', formValues.location_id);
      
      // Determine equipment type from name
      const equipmentType = detectEquipmentType(equipment.name);
      console.log('Detected equipment type:', equipmentType);
      
      // Validate equipment type
      if (!isValidEquipmentType(equipmentType)) {
        console.error('Invalid equipment type detected:', equipmentType);
        throw new Error('Invalid equipment type');
      }
      
      // CRITICAL FIX: Track database and user-selected locations - especially for restrooms
      const isRestroom = equipmentType === 'restroom';
      const hasLocationMismatch = isRestroom && equipment.location !== originalLocationId;
      
      if (hasLocationMismatch) {
        console.warn(`Location mismatch detected: Equipment "${equipment.name}" has database location "${equipment.location}" but user selected "${originalLocationId}"`);
        console.log('CRITICAL: Using user-selected location for submission:', originalLocationId);
      }
      
      // Map form data to database schema - using the original user-selected location_id
      // CRITICAL FIX: Include user's company_id in the submission data
      const submissionData = mapMaintenanceData({
        ...formValues,
        location_id: originalLocationId, // Ensure user selection is used
        company_id: userProfile.company_id // CRITICAL: Include user's company_id for RLS
      }, equipmentType, !!initialData);
      
      // CRITICAL FIX: Final verification before database submission
      console.log('Final submission data:', JSON.stringify(submissionData, null, 2));
      console.log('Final location_id to be submitted:', submissionData.location_id);
      console.log('Original user-selected location_id:', originalLocationId);
      
      // Extra safeguard to ensure location_id is preserved
      if (submissionData.location_id !== originalLocationId) {
        console.error('CRITICAL ISSUE: Location ID was changed during mapping! Restoring user selection.');
        submissionData.location_id = originalLocationId;
      }
      
      // Submit to database (update or create)
      let dbResponse;
      if (initialData && initialData.id) {
        console.log('Updating existing check with ID:', initialData.id);
        dbResponse = await maintenanceDbService.updateMaintenanceCheck(initialData.id, submissionData);
        console.log('Update response:', dbResponse);
      } else {
        dbResponse = await maintenanceDbService.createMaintenanceCheck(submissionData);
        console.log('Create response:', dbResponse);
      }
      
      // Handle errors
      if (dbResponse.error) {
        console.error('Submission error:', dbResponse.error);
        throw dbResponse.error;
      }

      // Show success toast
      toast({
        title: "Success",
        description: `Maintenance check ${initialData ? 'updated' : 'recorded'} successfully`,
      });
      
      // Check for filter-related actions and trigger prompt if needed
      const filterPromptTriggered = onFilterPromptNeeded && onFilterPromptNeeded(
        equipment.id,
        equipment.name,
        formValues
      );
      
      // Only complete if no filter prompt is shown
      if (!filterPromptTriggered) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error submitting maintenance check:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${initialData ? 'update' : 'submit'} maintenance check. Please try again.`,
      });
      throw error; // Re-throw to let the caller handle it
    }
  };

  return handleSubmit;
};

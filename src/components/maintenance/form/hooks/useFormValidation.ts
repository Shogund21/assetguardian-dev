
import { useToast } from "@/hooks/use-toast";
import { MaintenanceFormValues } from "./schema/maintenanceFormSchema";

export const useFormValidation = () => {
  const { toast } = useToast();
  
  const validateForm = (values: MaintenanceFormValues, equipmentType?: string): boolean => {
    // Check required fields
    if (!values.equipment_id || !values.technician_id) {
      console.error('Missing required fields:', { 
        equipment_id: values.equipment_id, 
        technician_id: values.technician_id 
      });
      
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select both equipment and technician",
      });
      
      return false;
    }
    
    // Equipment-specific validation for critical readings
    if (equipmentType === 'chiller') {
      const criticalChillerFields = [
        { key: 'evaporator_leaving_water_temp', label: 'Evaporator Leaving Water Temperature' },
        { key: 'evaporator_entering_water_temp', label: 'Evaporator Entering Water Temperature' },
        { key: 'condenser_entering_water_temp', label: 'Condenser Entering Water Temperature' },
        { key: 'condenser_leaving_water_temp', label: 'Condenser Leaving Water Temperature' },
      ];
      
      const missingFields = criticalChillerFields.filter(field => 
        !values[field.key as keyof MaintenanceFormValues] || 
        values[field.key as keyof MaintenanceFormValues] === ''
      );
      
      if (missingFields.length > 0) {
        toast({
          variant: "destructive",
          title: "Critical Chiller Readings Missing",
          description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
        });
        return false;
      }
    }
    
    // Log form values for debugging
    console.log('Validating form with values:', {
      equipment_id: values.equipment_id,
      location_id: values.location_id || 'not set',
      equipmentType
    });
    
    return true;
  };
  
  return validateForm;
};

export default useFormValidation;

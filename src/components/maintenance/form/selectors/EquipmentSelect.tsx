
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentQuery } from "@/hooks/useEquipmentQuery";
import { useEffect } from "react";
import { Equipment } from "@/types/equipment";

interface EquipmentSelectProps {
  form: UseFormReturn<any>;
  locationId: string;
}

const EquipmentSelect = ({ form, locationId }: EquipmentSelectProps) => {
  const { toast } = useToast();
  const selectedEquipmentId = form.watch('equipment_id');
  
  // Use custom hook to get equipment for location
  const { data: equipment = [], isLoading, isError } = useEquipmentQuery(locationId);
  
  // Debug logs
  useEffect(() => {
    console.log('EquipmentSelect: locationId =', locationId);
    console.log('EquipmentSelect: selectedEquipmentId =', selectedEquipmentId);
    console.log('EquipmentSelect: equipment count =', equipment?.length || 0);
  }, [locationId, selectedEquipmentId, equipment]);

  const handleEquipmentChange = (value: string) => {
    console.log('EquipmentSelect: Equipment selection changed to:', value);
    
    try {
      // Get the selected equipment details
      const selectedEquipment = equipment.find(eq => eq.id === value) as Equipment | undefined;
      
      if (selectedEquipment) {
        console.log('EquipmentSelect: Equipment database location:', selectedEquipment.location);
        console.log('EquipmentSelect: Current selected locationId:', locationId);
        
        // Log, but don't warn about location mismatches
        if (selectedEquipment.location !== locationId) {
          console.log('EquipmentSelect: Equipment has database location', 
            selectedEquipment.location, 'but will use user-selected location', locationId);
        }
      }
      
      // Set equipment ID in form - FIXED: Use simple string value
      form.setValue('equipment_id', value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
      
      // Verify location_id is still intact after selecting equipment
      setTimeout(() => {
        const currentEquipmentId = form.getValues('equipment_id');
        const currentLocationId = form.getValues('location_id');
        console.log('EquipmentSelect: Verification - equipment_id after change:', currentEquipmentId);
        console.log('EquipmentSelect: Verification - location_id is still:', currentLocationId);
      }, 100);
      
    } catch (error) {
      console.error('Error in handleEquipmentChange:', error);
      toast({
        title: "Error selecting equipment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Disable the dropdown when no location is selected
  const isDisabled = !locationId;

  return (
    <FormField
      control={form.control}
      name="equipment_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold text-gray-700">Equipment</FormLabel>
          <Select
            onValueChange={handleEquipmentChange}
            value={field.value || ''}
            disabled={isDisabled}
          >
            <FormControl>
              <SelectTrigger 
                className={`w-full bg-white border border-gray-200 h-12 hover:bg-gray-50 transition-colors ${
                  isDisabled ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <SelectValue 
                  placeholder={
                    isDisabled 
                      ? "Select a location first" 
                      : isLoading 
                      ? "Loading equipment..." 
                      : "Select equipment"
                  } 
                  className="text-gray-600"
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent 
              className="z-[1000] bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-[--radix-select-trigger-width] max-h-[300px] overflow-y-auto"
            >
              {isLoading ? (
                <SelectItem value="loading-placeholder" disabled className="py-3 px-4 text-sm text-gray-500">
                  Loading equipment...
                </SelectItem>
              ) : isError ? (
                <SelectItem value="error-placeholder" disabled className="py-3 px-4 text-sm text-red-500">
                  Error loading equipment
                </SelectItem>
              ) : equipment.length > 0 ? (
                equipment.map((eq) => (
                  <SelectItem 
                    key={eq.id} 
                    value={eq.id}
                    className="py-3 px-4 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-600"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {eq.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {eq.model ? `Model: ${eq.model}` : 'No model specified'}
                      </span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-equipment-placeholder" disabled className="py-3 px-4 text-sm text-gray-500">
                  No equipment available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage className="text-sm text-red-500" />
        </FormItem>
      )}
    />
  );
};

export default EquipmentSelect;

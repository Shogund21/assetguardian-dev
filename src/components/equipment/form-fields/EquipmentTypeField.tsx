
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { EQUIPMENT_TYPES } from "../constants/equipmentTypes";
import { EquipmentFormValues } from "../types";

interface EquipmentTypeFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
}

const EquipmentTypeField = ({ form }: EquipmentTypeFieldProps) => {
  const detectEquipmentType = (name: string): string => {
    const lowerName = name.toLowerCase();
    
    // Enhanced chiller detection for all variations
    if (lowerName.includes('chiller')) {
      return 'chiller';
    }
    
    if (lowerName.includes('ahu') || lowerName.includes('air handler')) {
      return 'ahu';
    }
    
    if (lowerName.includes('rtu') || lowerName.includes('rooftop')) {
      return 'rtu';
    }
    
    if (lowerName.includes('cooling tower')) {
      return 'cooling_tower';
    }
    
    if (lowerName.includes('elevator')) {
      return 'elevator';
    }
    
    if (lowerName.includes('restroom')) {
      return 'restroom';
    }
    
    return 'general';
  };

  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Equipment Type</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              // Auto-set the type category based on the name
              const detectedType = detectEquipmentType(value);
              form.setValue('type', detectedType);
            }}
            value={field.value}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full bg-white border-gray-200 h-12">
                <SelectValue placeholder="Select equipment type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white max-h-60 overflow-y-auto">
              {EQUIPMENT_TYPES.map((type) => (
                <SelectItem 
                  key={type} 
                  value={type}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EquipmentTypeField;

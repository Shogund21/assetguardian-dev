
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
              if (value.toLowerCase().includes('chiller')) {
                form.setValue('type', 'chiller');
              } else if (value.toLowerCase().includes('ahu') || value.toLowerCase().includes('air handler')) {
                form.setValue('type', 'ahu');
              } else if (value.toLowerCase().includes('rtu') || value.toLowerCase().includes('rooftop')) {
                form.setValue('type', 'rtu');
              } else if (value.toLowerCase().includes('cooling tower')) {
                form.setValue('type', 'cooling_tower');
              } else if (value.toLowerCase().includes('elevator')) {
                form.setValue('type', 'elevator');
              } else if (value.toLowerCase().includes('restroom')) {
                form.setValue('type', 'restroom');
              } else {
                form.setValue('type', 'general');
              }
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


import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Wrench, Edit3 } from "lucide-react";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";

interface ReadingModeSelectorProps {
  form: UseFormReturn<MaintenanceFormValues>;
  equipmentType?: string;
}

const ReadingModeSelector = ({ form, equipmentType }: ReadingModeSelectorProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="reading_mode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Reading Collection Method</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value || "standard"}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                  <RadioGroupItem value="standard" id="standard" />
                  <div className="flex-1">
                    <label htmlFor="standard" className="flex items-center gap-2 cursor-pointer">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Standard Readings</span>
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Use industry-standard readings for {equipmentType || 'this equipment'}. 
                      Pre-configured fields with proper ranges and units.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                  <RadioGroupItem value="manual" id="manual" />
                  <div className="flex-1">
                    <label htmlFor="manual" className="flex items-center gap-2 cursor-pointer">
                      <Edit3 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Manual Readings</span>
                      <Badge variant="outline" className="text-xs">Custom</Badge>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Add custom readings as needed. Flexible input fields for 
                      specialized equipment or unique maintenance requirements.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ReadingModeSelector;

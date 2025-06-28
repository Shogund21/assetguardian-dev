
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera, Edit3, Settings } from "lucide-react";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";

interface ReadingModeSelectorProps {
  form: UseFormReturn<MaintenanceFormValues>;
  equipmentType?: string;
}

const ReadingModeSelector = ({ form, equipmentType }: ReadingModeSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="reading_mode"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel className="text-base font-medium">Reading Input Mode</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value || "standard"}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="standard" id="standard" />
                <label htmlFor="standard" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Standard</div>
                    <div className="text-sm text-gray-500">Pre-defined form fields</div>
                  </div>
                </label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="ai_image" id="ai_image" />
                <label htmlFor="ai_image" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Camera className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">AI Image</div>
                    <div className="text-sm text-gray-500">Extract from photos</div>
                  </div>
                </label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="manual" id="manual" />
                <label htmlFor="manual" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Edit3 className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Manual</div>
                    <div className="text-sm text-gray-500">Custom readings</div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </FormContent>
        </FormItem>
      )}
    />
  );
};

export default ReadingModeSelector;

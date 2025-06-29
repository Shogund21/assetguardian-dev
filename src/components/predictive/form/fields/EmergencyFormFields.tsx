
import React from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface EmergencyFormFieldsProps {
  control: Control<any>;
}

export const EmergencyFormFields = ({ control }: EmergencyFormFieldsProps) => {
  console.log('🚨 EMERGENCY: Rendering basic form fields as fallback');
  
  return (
    <div className="space-y-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
      <div className="text-red-800 font-bold text-center">⚠️ EMERGENCY MODE - Basic Form Fields</div>
      
      <FormField
        control={control}
        name="reading_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reading Type</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter reading type" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Value</FormLabel>
            <FormControl>
              <Input type="number" {...field} placeholder="Enter value" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="unit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unit</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter unit" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};


import React from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ValueFieldProps {
  control: Control<any>;
}

export const ValueField = ({ control }: ValueFieldProps) => {
  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <FormField
        control={control}
        name="value"
        render={({ field, fieldState }) => (
          <FormItem className="w-full">
            <FormLabel className="text-base font-bold text-gray-900">🔢 Reading Value</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Enter reading value" 
                className="min-h-[52px] touch-manipulation text-base bg-white border-2 border-gray-300"
                {...field} 
              />
            </FormControl>
            <FormMessage />
            {fieldState.error && (
              <div className="text-xs text-red-600 bg-red-100 p-2 rounded mt-1 border border-red-200">
                Error: {fieldState.error.message}
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};

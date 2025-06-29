
import React from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ReadingTemplate {
  type: string;
  label: string;
  unit: string;
}

interface UnitFieldProps {
  control: Control<any>;
  templateReading?: ReadingTemplate;
  readingMode: "manual" | "ai_image";
}

export const UnitField = ({ control, templateReading, readingMode }: UnitFieldProps) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
      <div className="text-blue-800 font-bold mb-2">📏 UNIT FIELD</div>
      <FormField
        control={control}
        name="unit"
        render={({ field, fieldState }) => (
          <FormItem className="w-full">
            <FormLabel className="text-base font-bold text-gray-900">Unit</FormLabel>
            <FormControl>
              <Input 
                placeholder={templateReading?.unit ? `e.g., ${templateReading.unit}` : "Unit"}
                className="min-h-[52px] touch-manipulation text-base bg-white border-2 border-gray-400"
                {...field}
              />
            </FormControl>
            {templateReading?.unit && readingMode === "manual" && (
              <div className="text-sm text-blue-600 bg-blue-100 p-2 rounded border border-blue-300 mt-2">
                💡 Suggested: <strong>{templateReading.unit}</strong>
              </div>
            )}
            <FormMessage />
            {fieldState.error && (
              <div className="text-xs text-red-600">Error: {fieldState.error.message}</div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};

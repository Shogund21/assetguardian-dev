
import React from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReadingTemplate {
  type: string;
  label: string;
  unit: string;
  section?: string;
  description?: string;
}

interface ReadingTypeFieldProps {
  control: Control<any>;
  readingTemplate: ReadingTemplate[];
  readingMode: "manual" | "ai_image";
  extractedReadings: any[];
  groupedReadings: Record<string, ReadingTemplate[]>;
}

export const ReadingTypeField = ({
  control,
  readingTemplate,
  readingMode,
  extractedReadings,
  groupedReadings
}: ReadingTypeFieldProps) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <FormField
        control={control}
        name="reading_type"
        render={({ field, fieldState }) => {
          console.log('🎯 Reading type field render:', { 
            value: field.value, 
            templateCount: readingTemplate.length,
            hasError: !!fieldState.error,
            error: fieldState.error?.message
          });
          
          return (
            <FormItem className="w-full">
              <FormLabel className="text-base font-bold text-gray-900">
                📝 Reading Type {fieldState.error && <span className="text-red-500">⚠️</span>}
              </FormLabel>
              {readingMode === "manual" ? (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-[52px] touch-manipulation text-base w-full bg-white border-2 border-gray-300 shadow-sm">
                      <SelectValue 
                        placeholder={
                          readingTemplate.length > 0 
                            ? `Select from ${readingTemplate.length} options` 
                            : "No templates available"
                        } 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[70vh] overflow-y-auto bg-white border-2 border-gray-300 shadow-xl z-[9999] w-full">
                    {readingTemplate.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <div className="text-lg mb-2">⚠️</div>
                        <div className="font-medium">No reading templates</div>
                        <div className="text-xs mt-2">Check equipment type</div>
                      </div>
                    ) : Object.keys(groupedReadings).length > 1 ? (
                      Object.entries(groupedReadings).map(([section, readings]) => (
                        <div key={section} className="border-b border-gray-200 last:border-b-0">
                          <div className="px-4 py-3 text-sm font-bold text-gray-800 bg-gray-100 sticky top-0">
                            📋 {section} ({readings.length} readings)
                          </div>
                          {readings.map((template) => (
                            <SelectItem 
                              key={template.type} 
                              value={template.type} 
                              className="pl-6 py-4 touch-manipulation min-h-[48px] text-base hover:bg-blue-50"
                            >
                              <div className="flex flex-col gap-1 w-full">
                                <span className="font-medium text-base">{template.label}</span>
                                <span className="text-sm text-gray-600">📏 {template.unit}</span>
                                {template.description && (
                                  <span className="text-xs text-gray-500">{template.description}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))
                    ) : (
                      readingTemplate.map((template) => (
                        <SelectItem 
                          key={template.type} 
                          value={template.type}
                          className="py-4 touch-manipulation min-h-[48px] text-base hover:bg-blue-50"
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <span className="font-medium text-base">{template.label}</span>
                            <span className="text-sm text-gray-500">📏 {template.unit}</span>
                            {template.description && (
                              <span className="text-xs text-gray-400">{template.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Reading type (from AI)" 
                    readOnly={extractedReadings.length > 0}
                    className="min-h-[52px] touch-manipulation text-base bg-white border-2 border-gray-300"
                  />
                </FormControl>
              )}
              <FormMessage />
              {fieldState.error && (
                <div className="text-xs text-red-600 bg-red-100 p-2 rounded mt-1 border border-red-200">
                  Error: {fieldState.error.message}
                </div>
              )}
            </FormItem>
          );
        }}
      />
    </div>
  );
};

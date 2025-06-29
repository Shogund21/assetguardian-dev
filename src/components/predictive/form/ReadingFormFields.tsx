
import React, { useMemo, useState } from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ReadingTemplate {
  type: string;
  label: string;
  unit: string;
  section?: string;
  description?: string;
}

interface ReadingFormFieldsProps {
  control: Control<any>;
  readingTemplate: ReadingTemplate[];
  readingMode: "manual" | "ai_image";
  extractedReadings: any[];
  templateReading?: ReadingTemplate;
}

export const ReadingFormFields = ({
  control,
  readingTemplate,
  readingMode,
  extractedReadings,
  templateReading
}: ReadingFormFieldsProps) => {
  // Group readings by section for better organization
  const groupedReadings = useMemo(() => {
    console.log('📊 ReadingFormFields - Grouping readings:', {
      totalReadings: readingTemplate.length,
      readingTypes: readingTemplate.map(r => r.type).slice(0, 5)
    });

    const grouped = readingTemplate.reduce((acc, reading) => {
      const section = reading.section || 'General';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(reading);
      return acc;
    }, {} as Record<string, ReadingTemplate[]>);

    console.log('📋 Grouped readings result:', {
      sections: Object.keys(grouped),
      sectionCounts: Object.fromEntries(
        Object.entries(grouped).map(([key, value]) => [key, value.length])
      )
    });

    return grouped;
  }, [readingTemplate]);

  return (
    <div className="space-y-6 w-full">
      {/* Status Display - Always show first */}
      <div className="space-y-3 w-full">
        {readingTemplate.length > 0 ? (
          <div className="text-sm text-green-700 p-4 bg-green-50 rounded-lg border-2 border-green-300">
            <div className="font-bold mb-2 flex items-center gap-2">
              ✅ Reading Templates Loaded Successfully
            </div>
            <div className="text-green-600 space-y-1">
              <div><strong>{readingTemplate.length}</strong> readings available</div>
              {Object.keys(groupedReadings).length > 1 && (
                <div>
                  Organized in <strong>{Object.keys(groupedReadings).length}</strong> sections: {Object.keys(groupedReadings).join(', ')}
                </div>
              )}
              {Object.keys(groupedReadings).length > 1 && (
                <div className="text-xs mt-2 space-y-1 bg-green-100 p-2 rounded">
                  {Object.entries(groupedReadings).map(([section, readings]) => (
                    <div key={section} className="flex justify-between">
                      <span>📂 {section}:</span>
                      <span className="font-medium">{readings.length} readings</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-700 p-4 bg-red-50 rounded-lg border-2 border-red-300">
            <div className="font-bold mb-2 flex items-center gap-2">
              ⚠️ No Reading Templates Found
            </div>
            <div className="text-red-600 text-xs space-y-1">
              <div>Equipment type may not be detected correctly</div>
              <div>Or no templates are configured for this equipment type</div>
              <div className="mt-2 font-medium">🔍 Try selecting different equipment or check template configuration</div>
            </div>
          </div>
        )}
      </div>

      {/* Reading Type Field - Enhanced for mobile with better dropdown */}
      <FormField
        control={control}
        name="reading_type"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-base font-bold">Reading Type</FormLabel>
            {readingMode === "manual" ? (
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="min-h-[48px] touch-manipulation mobile-touch-target text-base w-full bg-white border-2 border-gray-300">
                    <SelectValue placeholder={
                      readingTemplate.length > 0 
                        ? "Select reading type" 
                        : "No reading templates available"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[70vh] overflow-y-auto bg-white border-2 border-gray-300 shadow-xl z-[9999] w-full">
                  {readingTemplate.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <div className="text-lg mb-2">⚠️</div>
                      <div className="font-medium">No reading templates available</div>
                      <div className="text-sm mt-1">Check equipment type detection</div>
                    </div>
                  ) : Object.keys(groupedReadings).length > 1 ? (
                    // Sectioned display for complex templates (like chiller)
                    Object.entries(groupedReadings).map(([section, readings]) => (
                      <div key={section} className="border-b border-gray-200 last:border-b-0">
                        <div className="px-4 py-3 text-sm font-bold text-gray-800 bg-gray-100 sticky top-0 border-b border-gray-300">
                          📋 {section} ({readings.length} readings)
                        </div>
                        {readings.map((template) => (
                          <SelectItem 
                            key={template.type} 
                            value={template.type} 
                            className="pl-6 py-4 touch-manipulation min-h-[48px] text-base"
                          >
                            <div className="flex flex-col gap-1 w-full">
                              <span className="font-medium text-base">{template.label}</span>
                              <span className="text-sm text-gray-600">
                                📏 {template.unit}
                                {template.description && (
                                  <span className="block text-xs text-gray-500 mt-1">
                                    {template.description}
                                  </span>
                                )}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))
                  ) : (
                    // Simple list for basic templates
                    readingTemplate.map((template) => (
                      <SelectItem 
                        key={template.type} 
                        value={template.type}
                        className="py-4 touch-manipulation min-h-[48px] text-base"
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <span className="font-medium text-base">{template.label}</span>
                          <span className="text-sm text-gray-500">📏 {template.unit}</span>
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
                  className="min-h-[48px] touch-manipulation text-base bg-white border-2 border-gray-300"
                />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Reading Value Field */}
      <FormField
        control={control}
        name="value"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-base font-bold">Reading Value</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Enter reading value" 
                className="min-h-[48px] touch-manipulation text-base mobile-form-field bg-white border-2 border-gray-300"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Unit Field */}
      <FormField
        control={control}
        name="unit"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-base font-bold">Unit</FormLabel>
            <FormControl>
              <Input 
                placeholder={templateReading?.unit ? `e.g., ${templateReading.unit}` : "Unit of measurement"}
                className="min-h-[48px] touch-manipulation text-base mobile-form-field bg-white border-2 border-gray-300"
                {...field}
              />
            </FormControl>
            {templateReading?.unit && readingMode === "manual" && (
              <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                💡 Suggested: <strong>{templateReading.unit}</strong> (you can edit this)
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes Field */}
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-base font-bold">Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Additional observations or notes" 
                className="min-h-[80px] touch-manipulation text-base resize-none mobile-form-field bg-white border-2 border-gray-300"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Location Notes Field */}
      <FormField
        control={control}
        name="location_notes"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-base font-bold">Location/Access Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Notes about where the reading was taken" 
                className="min-h-[80px] touch-manipulation text-base resize-none mobile-form-field bg-white border-2 border-gray-300"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

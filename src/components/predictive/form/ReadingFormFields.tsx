
import React, { useMemo } from "react";
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
  
  console.log('🎨 ReadingFormFields rendering with:', {
    templateCount: readingTemplate.length,
    readingMode,
    extractedCount: extractedReadings.length,
    hasControl: !!control
  });

  // Group readings by section for better organization
  const groupedReadings = useMemo(() => {
    console.log('📊 Grouping readings:', readingTemplate.length);

    const grouped = readingTemplate.reduce((acc, reading) => {
      const section = reading.section || 'General';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(reading);
      return acc;
    }, {} as Record<string, ReadingTemplate[]>);

    console.log('📋 Grouped sections:', Object.keys(grouped));
    return grouped;
  }, [readingTemplate]);

  // PHASE 1: Always render with visibility indicators
  return (
    <div className="space-y-6 w-full bg-white p-4 rounded-lg border-2 border-gray-300">
      <div className="bg-purple-100 p-3 rounded-lg border border-purple-300">
        <div className="text-purple-800 font-bold">🔍 FORM FIELDS DEBUG</div>
        <div className="text-xs text-purple-700 space-y-1 mt-2">
          <div>Templates loaded: {readingTemplate.length}</div>
          <div>Reading mode: {readingMode}</div>
          <div>Form control: {control ? '✅' : '❌'}</div>
          <div>Sections: {Object.keys(groupedReadings).join(', ')}</div>
        </div>
      </div>

      {/* PHASE 2: Template Status - Always visible */}
      <div className="space-y-3 w-full">
        {readingTemplate.length > 0 ? (
          <div className="text-sm text-green-700 p-4 bg-green-50 rounded-lg border-2 border-green-400">
            <div className="font-bold mb-2 flex items-center gap-2">
              ✅ {readingTemplate.length} Reading Templates Loaded
            </div>
            <div className="text-green-600 space-y-1">
              {Object.keys(groupedReadings).length > 1 && (
                <div>Sections: {Object.keys(groupedReadings).join(', ')}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-700 p-4 bg-red-50 rounded-lg border-2 border-red-400">
            <div className="font-bold mb-2">⚠️ No Reading Templates Found</div>
            <div className="text-red-600 text-xs">Equipment type: {readingMode}</div>
          </div>
        )}
      </div>

      {/* PHASE 3: Reading Type Field - Enhanced for mobile with debugging */}
      <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
        <div className="text-yellow-800 font-bold mb-2">📝 READING TYPE FIELD</div>
        <FormField
          control={control}
          name="reading_type"
          render={({ field }) => {
            console.log('🎯 Reading type field rendering:', { 
              value: field.value, 
              templateCount: readingTemplate.length 
            });
            
            return (
              <FormItem className="w-full">
                <FormLabel className="text-base font-bold text-gray-900">Reading Type</FormLabel>
                {readingMode === "manual" ? (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="min-h-[52px] touch-manipulation text-base w-full bg-white border-2 border-gray-400 shadow-sm">
                        <SelectValue placeholder={
                          readingTemplate.length > 0 
                            ? "Select reading type" 
                            : "No templates available"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[70vh] overflow-y-auto bg-white border-2 border-gray-400 shadow-xl z-[9999] w-full">
                      {readingTemplate.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <div className="text-lg mb-2">⚠️</div>
                          <div className="font-medium">No reading templates</div>
                        </div>
                      ) : Object.keys(groupedReadings).length > 1 ? (
                        // Sectioned display for complex templates
                        Object.entries(groupedReadings).map(([section, readings]) => (
                          <div key={section} className="border-b border-gray-200 last:border-b-0">
                            <div className="px-4 py-3 text-sm font-bold text-gray-800 bg-gray-100 sticky top-0">
                              📋 {section} ({readings.length})
                            </div>
                            {readings.map((template) => (
                              <SelectItem 
                                key={template.type} 
                                value={template.type} 
                                className="pl-6 py-4 touch-manipulation min-h-[48px] text-base"
                              >
                                <div className="flex flex-col gap-1 w-full">
                                  <span className="font-medium text-base">{template.label}</span>
                                  <span className="text-sm text-gray-600">📏 {template.unit}</span>
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
                      className="min-h-[52px] touch-manipulation text-base bg-white border-2 border-gray-400"
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>

      {/* PHASE 4: Reading Value Field - Always visible */}
      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
        <div className="text-green-800 font-bold mb-2">🔢 VALUE FIELD</div>
        <FormField
          control={control}
          name="value"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-base font-bold text-gray-900">Reading Value</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="Enter reading value" 
                  className="min-h-[52px] touch-manipulation text-base bg-white border-2 border-gray-400"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* PHASE 5: Unit Field - Always visible */}
      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
        <div className="text-blue-800 font-bold mb-2">📏 UNIT FIELD</div>
        <FormField
          control={control}
          name="unit"
          render={({ field }) => (
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
                <p className="text-sm text-blue-600 bg-blue-100 p-2 rounded border border-blue-300">
                  💡 Suggested: <strong>{templateReading.unit}</strong>
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* PHASE 6: Notes Fields - Always visible */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
        <div className="text-gray-800 font-bold mb-4">📝 NOTES SECTION</div>
        
        <div className="space-y-4">
          <FormField
            control={control}
            name="notes"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-base font-bold text-gray-900">Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Additional observations" 
                    className="min-h-[80px] touch-manipulation text-base bg-white border-2 border-gray-400 resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="location_notes"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-base font-bold text-gray-900">Location Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Notes about location" 
                    className="min-h-[80px] touch-manipulation text-base bg-white border-2 border-gray-400 resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

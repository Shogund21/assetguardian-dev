
import React, { useMemo } from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

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
  // Default to expanding first section for better UX
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Evaporator', 'General']));

  // Group readings by section for better organization
  const groupedReadings = useMemo(() => {
    const grouped = readingTemplate.reduce((acc, reading) => {
      const section = reading.section || 'General';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(reading);
      return acc;
    }, {} as Record<string, ReadingTemplate[]>);

    return grouped;
  }, [readingTemplate]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Debug logging
  console.log('ReadingFormFields rendered with:', {
    templateCount: readingTemplate.length,
    sections: Object.keys(groupedReadings),
    readingMode,
    hasReadings: readingTemplate.length > 0
  });

  return (
    <>
      <FormField
        control={control}
        name="reading_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reading Type</FormLabel>
            {readingMode === "manual" ? (
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="min-h-[44px] touch-manipulation">
                    <SelectValue placeholder={
                      readingTemplate.length > 0 
                        ? "Select reading type" 
                        : "No reading templates available"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {readingTemplate.length === 0 ? (
                    <div className="px-2 py-4 text-center text-gray-500">
                      No reading templates available
                    </div>
                  ) : Object.keys(groupedReadings).length > 1 ? (
                    // Sectioned display for complex templates (like chiller)
                    Object.entries(groupedReadings).map(([section, readings]) => (
                      <div key={section}>
                        <div className="px-2 py-2 text-sm font-semibold text-gray-700 bg-gray-100 sticky top-0 border-b">
                          {section} ({readings.length} readings)
                        </div>
                        {readings.map((template) => (
                          <SelectItem key={template.type} value={template.type} className="pl-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{template.label}</span>
                              <span className="text-xs text-gray-500">
                                {template.unit}
                                {template.description && ` - ${template.description}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))
                  ) : (
                    // Simple list for basic templates
                    readingTemplate.map((template) => (
                      <SelectItem key={template.type} value={template.type}>
                        <div className="flex flex-col">
                          <span>{template.label}</span>
                          <span className="text-xs text-gray-500">({template.unit})</span>
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
                  className="min-h-[44px] touch-manipulation"
                />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reading Value</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Enter reading value" 
                className="min-h-[44px] touch-manipulation text-base"
                {...field} 
              />
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
              <Input 
                placeholder={templateReading?.unit ? `e.g., ${templateReading.unit}` : "Unit of measurement"}
                className="min-h-[44px] touch-manipulation text-base"
                {...field}
              />
            </FormControl>
            {templateReading?.unit && readingMode === "manual" && (
              <p className="text-xs text-muted-foreground">
                Suggested: {templateReading.unit} (you can edit this)
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Additional observations or notes" 
                className="min-h-[80px] touch-manipulation text-base"
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
          <FormItem>
            <FormLabel>Location/Access Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Notes about where the reading was taken" 
                className="min-h-[80px] touch-manipulation text-base"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Enhanced template info display */}
      {readingTemplate.length > 0 && (
        <div className="text-sm text-blue-700 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="font-medium mb-1">✓ Reading Templates Loaded</div>
          <div className="text-xs text-blue-600">
            {readingTemplate.length} readings available
            {Object.keys(groupedReadings).length > 1 && (
              <span> in {Object.keys(groupedReadings).length} sections: {Object.keys(groupedReadings).join(', ')}</span>
            )}
          </div>
        </div>
      )}

      {/* Show warning if no templates loaded */}
      {readingTemplate.length === 0 && (
        <div className="text-sm text-orange-700 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="font-medium mb-1">⚠ No Reading Templates</div>
          <div className="text-xs text-orange-600">
            Equipment type may not be detected correctly, or no templates are configured for this equipment type.
          </div>
        </div>
      )}
    </>
  );
};

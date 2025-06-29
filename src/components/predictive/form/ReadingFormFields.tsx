
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Evaporator']));

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
    readingMode
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
                    <SelectValue placeholder="Select reading type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {Object.keys(groupedReadings).length > 1 ? (
                    // Sectioned display for complex templates (like chiller)
                    Object.entries(groupedReadings).map(([section, readings]) => (
                      <div key={section}>
                        <div className="px-2 py-1 text-sm font-semibold text-gray-600 bg-gray-50 sticky top-0">
                          {section}
                        </div>
                        {readings.map((template) => (
                          <SelectItem key={template.type} value={template.type} className="pl-4">
                            <div className="flex flex-col">
                              <span>{template.label}</span>
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

      {/* Show template info for debugging */}
      {readingTemplate.length > 0 && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <strong>Available readings:</strong> {readingTemplate.length} templates loaded
          {Object.keys(groupedReadings).length > 1 && (
            <div>Sections: {Object.keys(groupedReadings).join(', ')}</div>
          )}
        </div>
      )}
    </>
  );
};

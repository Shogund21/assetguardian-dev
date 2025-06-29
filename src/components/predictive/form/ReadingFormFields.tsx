
import React from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ReadingTemplate {
  type: string;
  label: string;
  unit: string;
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
                <SelectContent>
                  {readingTemplate.map((template) => (
                    <SelectItem key={template.type} value={template.type}>
                      {template.label} ({template.unit})
                    </SelectItem>
                  ))}
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
    </>
  );
};

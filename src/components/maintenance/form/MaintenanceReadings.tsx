
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";
import ReadingModeSelector from "./ReadingModeSelector";
import ManualReadingFields from "./ManualReadingFields";

interface MaintenanceReadingsProps {
  form: UseFormReturn<MaintenanceFormValues>;
  equipmentType?: string;
}

const MaintenanceReadings = ({ form, equipmentType }: MaintenanceReadingsProps) => {
  const readingMode = form.watch('reading_mode') || 'standard';
  const templateReadings = equipmentType ? getEquipmentReadingTemplate(equipmentType) : [];

  // If manual mode is selected, show the manual reading fields
  if (readingMode === 'manual') {
    return (
      <div className="space-y-6">
        <ReadingModeSelector form={form} equipmentType={equipmentType} />
        <ManualReadingFields form={form} equipmentType={equipmentType} />
      </div>
    );
  }

  // Standard mode - show template-based readings or fallback to original fields
  return (
    <div className="space-y-6">
      <ReadingModeSelector form={form} equipmentType={equipmentType} />
      
      {templateReadings.length > 0 ? (
        // Show template-based readings
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templateReadings.map((template) => (
            <FormField
              key={template.type}
              control={form.control}
              name={template.type as keyof MaintenanceFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {template.label}
                    {template.normalRange && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Normal: {template.normalRange.min}-{template.normalRange.max} {template.unit})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={`Enter ${template.label.toLowerCase()}`}
                      value={typeof field.value === 'string' ? field.value : ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  {template.description && (
                    <p className="text-xs text-gray-600">{template.description}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      ) : (
        // Fallback to original hardcoded fields
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="chiller_pressure_reading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chiller Pressure Reading (PSI)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-gray-200">
                      <SelectValue placeholder="Enter pressure or select NA" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent 
                    className="bg-white border border-gray-200 shadow-lg z-[100]"
                    position="popper"
                  >
                    <SelectItem value="NA">Not Applicable</SelectItem>
                    {[...Array(100)].map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {i} PSI
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chiller_temperature_reading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chiller Temperature Reading (°F)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-gray-200">
                      <SelectValue placeholder="Enter temperature or select NA" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent 
                    className="bg-white border border-gray-200 shadow-lg z-[100]"
                    position="popper"
                  >
                    <SelectItem value="NA">Not Applicable</SelectItem>
                    {[...Array(150)].map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {i}°F
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="air_filter_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Air Filter Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-gray-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent 
                    className="bg-white border border-gray-200 shadow-lg z-[100]"
                    position="popper"
                  >
                    <SelectItem value="NA">Not Applicable</SelectItem>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="needs_cleaning">Needs Cleaning</SelectItem>
                    <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="belt_condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Belt Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-gray-200">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent 
                    className="bg-white border border-gray-200 shadow-lg z-[100]"
                    position="popper"
                  >
                    <SelectItem value="NA">Not Applicable</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default MaintenanceReadings;


import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";
import { getMaintenanceTemplate, getAllFrequenciesForEquipment } from "@/utils/tieredMaintenanceTemplates";

interface MaintenanceFrequencySelectorProps {
  form: UseFormReturn<MaintenanceFormValues>;
  equipmentType: string | null;
}

const MaintenanceFrequencySelector = ({ form, equipmentType }: MaintenanceFrequencySelectorProps) => {
  if (!equipmentType) return null;

  const frequencies = getAllFrequenciesForEquipment(equipmentType);
  const selectedFrequency = form.watch('maintenance_frequency') || 'daily';
  const template = getMaintenanceTemplate(equipmentType, selectedFrequency);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="maintenance_frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Maintenance Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || 'daily'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select maintenance frequency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {frequencies.map((frequency) => {
                  const freq_template = getMaintenanceTemplate(equipmentType, frequency);
                  return (
                    <SelectItem key={frequency} value={frequency}>
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{frequency}</span>
                        {freq_template && (
                          <Badge variant="outline" className="text-xs">
                            {freq_template.estimatedTime}min
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {template && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900 capitalize">{template.frequency} Maintenance</span>
            <Badge variant="outline" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              {template.estimatedTime} min
            </Badge>
          </div>
          <p className="text-sm text-blue-700 mb-3">{template.description}</p>
          <div className="text-xs text-blue-600">
            <span className="font-medium">Required readings:</span> {template.requiredFields.length}
            {template.optionalFields.length > 0 && (
              <span className="ml-4"><span className="font-medium">Optional:</span> {template.optionalFields.length}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceFrequencySelector;

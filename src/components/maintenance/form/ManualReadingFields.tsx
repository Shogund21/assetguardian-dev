
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Lightbulb } from "lucide-react";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";
import { getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";

interface ManualReadingFieldsProps {
  form: UseFormReturn<MaintenanceFormValues>;
  equipmentType?: string;
}

interface ManualReading {
  id: string;
  type: string;
  label: string;
  value: string;
  unit: string;
  notes: string;
}

const ManualReadingFields = ({ form, equipmentType }: ManualReadingFieldsProps) => {
  const [readings, setReadings] = useState<ManualReading[]>([
    { id: '1', type: '', label: '', value: '', unit: '', notes: '' }
  ]);

  // Get template suggestions for this equipment type
  const templateReadings = equipmentType ? getEquipmentReadingTemplate(equipmentType) : [];

  const addReading = () => {
    const newReading: ManualReading = {
      id: Date.now().toString(),
      type: '',
      label: '',
      value: '',
      unit: '',
      notes: ''
    };
    setReadings([...readings, newReading]);
  };

  const removeReading = (id: string) => {
    if (readings.length > 1) {
      setReadings(readings.filter(r => r.id !== id));
    }
  };

  const updateReading = (id: string, field: keyof ManualReading, value: string) => {
    setReadings(readings.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
    
    // Update form with manual readings data
    form.setValue('manual_readings', readings);
  };

  const useTemplate = (templateReading: any, readingId: string) => {
    updateReading(readingId, 'type', templateReading.type);
    updateReading(readingId, 'label', templateReading.label);
    updateReading(readingId, 'unit', templateReading.unit);
  };

  return (
    <div className="space-y-4">
      {templateReadings.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Lightbulb className="h-4 w-4" />
              Suggested Readings for {equipmentType?.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {templateReadings.slice(0, 6).map((template) => (
                <Button
                  key={template.type}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-blue-100 border-blue-300 hover:bg-blue-200"
                  onClick={() => useTemplate(template, readings[0]?.id)}
                >
                  {template.label} ({template.unit})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {readings.map((reading, index) => (
        <Card key={reading.id} className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Reading #{index + 1}</h4>
            {readings.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeReading(reading.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Reading Type</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., temperature, pressure, current"
                  value={reading.type}
                  onChange={(e) => updateReading(reading.id, 'type', e.target.value)}
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Reading Label</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Supply Air Temperature"
                  value={reading.label}
                  onChange={(e) => updateReading(reading.id, 'label', e.target.value)}
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter reading value"
                  value={reading.value}
                  onChange={(e) => updateReading(reading.id, 'value', e.target.value)}
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., °F, PSI, Amps"
                  value={reading.unit}
                  onChange={(e) => updateReading(reading.id, 'unit', e.target.value)}
                />
              </FormControl>
            </FormItem>

            <div className="md:col-span-2">
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional observations or context for this reading"
                    value={reading.notes}
                    onChange={(e) => updateReading(reading.id, 'notes', e.target.value)}
                    rows={2}
                  />
                </FormControl>
              </FormItem>
            </div>
          </div>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addReading}
        className="w-full border-dashed border-2 hover:bg-gray-50"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Reading
      </Button>
    </div>
  );
};

export default ManualReadingFields;

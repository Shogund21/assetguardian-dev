
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";

const readingSchema = z.object({
  equipment_id: z.string().min(1, "Equipment is required"),
  reading_type: z.string().min(1, "Reading type is required"),
  value: z.string().min(1, "Value is required"),
  unit: z.string().min(1, "Unit is required"),
  notes: z.string().optional(),
  location_notes: z.string().optional(),
});

type ReadingFormValues = z.infer<typeof readingSchema>;

interface ManualReadingEntryProps {
  equipmentId?: string;
  equipmentType?: string;
  onSuccess?: () => void;
}

const ManualReadingEntry = ({ equipmentId, equipmentType, onSuccess }: ManualReadingEntryProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
      equipment_id: equipmentId || "",
      reading_type: "",
      value: "",
      unit: "",
      notes: "",
      location_notes: "",
    },
  });

  // Get reading template based on equipment type
  const readingTemplate = equipmentType ? getEquipmentReadingTemplate(equipmentType) : [];

  // Watch for reading type changes to auto-populate unit
  const selectedReadingType = form.watch('reading_type');
  const selectedReading = readingTemplate.find(t => t.type === selectedReadingType);

  // Auto-populate unit when reading type changes, but allow manual override
  React.useEffect(() => {
    if (selectedReading?.unit && !form.getValues('unit')) {
      form.setValue('unit', selectedReading.unit);
    }
  }, [selectedReading, form]);

  const onSubmit = async (values: ReadingFormValues) => {
    setIsSubmitting(true);
    try {
      // Store the manual reading in sensor_readings table
      const { error } = await supabase
        .from('sensor_readings')
        .insert({
          equipment_id: values.equipment_id,
          sensor_type: values.reading_type,
          value: parseFloat(values.value),
          unit: values.unit,
          timestamp_utc: new Date().toISOString(),
        });

      if (error) throw error;

      // Store additional notes if provided
      if (values.notes || values.location_notes) {
        await supabase
          .from('maintenance_documents')
          .insert({
            equipment_id: values.equipment_id,
            file_name: `Manual Reading - ${values.reading_type}`,
            file_path: 'manual_entry',
            file_type: 'text/plain',
            file_size: 0,
            category: 'manual_reading',
            comments: `${values.notes || ''}\nLocation Notes: ${values.location_notes || ''}`,
            tags: ['manual_reading', values.reading_type],
          });
      }

      toast({
        title: "Success",
        description: "Reading recorded successfully",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving reading:', error);
      toast({
        title: "Error",
        description: "Failed to save reading",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Manual Reading</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reading_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reading Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reading Value</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Enter reading value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={selectedReading?.unit ? `e.g., ${selectedReading.unit}` : "Unit of measurement"}
                      {...field}
                    />
                  </FormControl>
                  {selectedReading?.unit && (
                    <p className="text-xs text-muted-foreground">
                      Suggested: {selectedReading.unit} (you can edit this)
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional observations or notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location/Access Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes about where the reading was taken" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white"
            >
              {isSubmitting ? "Recording..." : "Record Reading"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ManualReadingEntry;

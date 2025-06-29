
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { offlineStorage } from "@/services/offlineStorageService";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import AIImageReader from "@/components/maintenance/form/AIImageReader";
import { Camera, Edit3, Settings } from "lucide-react";

const readingSchema = z.object({
  equipment_id: z.string().min(1, "Equipment is required"),
  reading_type: z.string().min(1, "Reading type is required"),
  value: z.string().min(1, "Value is required"),
  unit: z.string().min(1, "Unit is required"),
  notes: z.string().optional(),
  location_notes: z.string().optional(),
  reading_mode: z.enum(["manual", "ai_image"]).optional(),
});

type ReadingFormValues = z.infer<typeof readingSchema>;

interface ManualReadingEntryProps {
  equipmentId?: string;
  equipmentType?: string;
  onSuccess?: () => void;
}

interface ExtractedReading {
  type: string;
  value: string;
  unit: string;
  confidence: number;
  location?: string;
}

const ManualReadingEntry = ({ equipmentId, equipmentType, onSuccess }: ManualReadingEntryProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readingMode, setReadingMode] = useState<"manual" | "ai_image">("manual");
  const [extractedReadings, setExtractedReadings] = useState<ExtractedReading[]>([]);
  const [selectedReading, setSelectedReading] = useState<ExtractedReading | null>(null);
  const { toast } = useToast();
  const { isOnline, updateUnsyncedCount } = useOfflineSync();
  
  const form = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
      equipment_id: equipmentId || "",
      reading_type: "",
      value: "",
      unit: "",
      notes: "",
      location_notes: "",
      reading_mode: "manual",
    },
  });

  // Get reading template based on equipment type
  const readingTemplate = equipmentType ? getEquipmentReadingTemplate(equipmentType) : [];

  // Watch for reading type changes to auto-populate unit
  const selectedReadingType = form.watch('reading_type');
  const templateReading = readingTemplate.find(t => t.type === selectedReadingType);

  // Auto-populate unit when reading type changes, but allow manual override
  useEffect(() => {
    if (templateReading?.unit && !form.getValues('unit')) {
      form.setValue('unit', templateReading.unit);
    }
  }, [templateReading, form]);

  // Handle AI image readings extraction
  const handleReadingsExtracted = (readings: ExtractedReading[], imageUrl: string) => {
    setExtractedReadings(readings);
    if (readings.length > 0) {
      // Auto-select the first reading with highest confidence
      const bestReading = readings.reduce((prev, current) => 
        (current.confidence > prev.confidence) ? current : prev
      );
      setSelectedReading(bestReading);
      
      // Auto-populate form with the best reading
      form.setValue('reading_type', bestReading.type);
      form.setValue('value', bestReading.value);
      form.setValue('unit', bestReading.unit);
      if (bestReading.location) {
        form.setValue('location_notes', bestReading.location);
      }
    }
  };

  // Handle selection of a different extracted reading
  const handleReadingSelection = (reading: ExtractedReading) => {
    setSelectedReading(reading);
    form.setValue('reading_type', reading.type);
    form.setValue('value', reading.value);
    form.setValue('unit', reading.unit);
    if (reading.location) {
      form.setValue('location_notes', reading.location);
    }
  };

  const onSubmit = async (values: ReadingFormValues) => {
    setIsSubmitting(true);
    try {
      const timestamp = new Date().toISOString();
      
      if (isOnline) {
        // Online mode - save directly to Supabase
        const { error } = await supabase
          .from('sensor_readings')
          .insert({
            equipment_id: values.equipment_id,
            sensor_type: values.reading_type,
            value: parseFloat(values.value),
            unit: values.unit,
            timestamp_utc: timestamp,
            source: readingMode === 'ai_image' ? 'ai_image' : 'manual'
          });

        if (error) throw error;

        // Store additional notes if provided
        if (values.notes || values.location_notes) {
          await supabase
            .from('maintenance_documents')
            .insert({
              equipment_id: values.equipment_id,
              file_name: `${readingMode === 'ai_image' ? 'AI Extracted' : 'Manual'} Reading - ${values.reading_type}`,
              file_path: 'manual_entry',
              file_type: 'text/plain',
              file_size: 0,
              category: 'manual_reading',
              comments: `${values.notes || ''}\nLocation Notes: ${values.location_notes || ''}${selectedReading?.confidence ? `\nAI Confidence: ${Math.round(selectedReading.confidence * 100)}%` : ''}`,
              tags: ['manual_reading', values.reading_type, readingMode],
            });
        }

        toast({
          title: "Success",
          description: `Reading recorded successfully via ${readingMode === 'ai_image' ? 'AI extraction' : 'manual entry'}`,
        });
      } else {
        // Offline mode - save to local storage
        await offlineStorage.storeReading({
          equipment_id: values.equipment_id,
          reading_type: values.reading_type,
          value: parseFloat(values.value),
          unit: values.unit,
          notes: values.notes,
          location_notes: values.location_notes,
          timestamp,
        });

        await updateUnsyncedCount();

        toast({
          title: "Saved Offline",
          description: "Reading saved locally. Will sync when connection is restored.",
        });
      }

      form.reset();
      setExtractedReadings([]);
      setSelectedReading(null);
      setReadingMode("manual");
      onSuccess?.();
    } catch (error) {
      console.error('Error saving reading:', error);
      toast({
        title: "Error",
        description: isOnline ? "Failed to save reading" : "Failed to save reading offline",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <OfflineIndicator />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Record Reading
            <div className="text-sm font-normal">
              {isOnline ? (
                <span className="text-green-600">● Online</span>
              ) : (
                <span className="text-orange-600">● Offline</span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Reading Mode Selector for Mobile */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-base font-medium">Choose Recording Method</label>
              <div className="text-xs text-gray-500 hidden md:block">
                Select how you want to record readings
              </div>
            </div>
            <RadioGroup
              value={readingMode}
              onValueChange={(value: "manual" | "ai_image") => setReadingMode(value)}
              className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
            >
              {/* Manual Entry Option */}
              <div className="relative">
                <RadioGroupItem 
                  value="manual" 
                  id="manual" 
                  className="sr-only peer" 
                />
                <label 
                  htmlFor="manual" 
                  className="flex items-center gap-3 p-4 min-h-[60px] md:min-h-[80px] border-2 rounded-lg cursor-pointer transition-all duration-200 peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:shadow-md hover:bg-gray-50 hover:border-gray-300 touch-manipulation"
                >
                  <div className="flex-shrink-0 p-2 rounded-full bg-purple-100 peer-checked:bg-purple-200">
                    <Edit3 className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-base md:text-lg">Manual Entry</div>
                    <div className="text-sm text-gray-600 mt-1">Type readings manually with keyboard</div>
                  </div>
                  {readingMode === "manual" && (
                    <div className="flex-shrink-0 w-3 h-3 bg-purple-500 rounded-full"></div>
                  )}
                </label>
              </div>
              
              {/* AI Camera Option */}
              <div className="relative">
                <RadioGroupItem 
                  value="ai_image" 
                  id="ai_image" 
                  className="sr-only peer" 
                />
                <label 
                  htmlFor="ai_image" 
                  className="flex items-center gap-3 p-4 min-h-[60px] md:min-h-[80px] border-2 rounded-lg cursor-pointer transition-all duration-200 peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:shadow-md hover:bg-gray-50 hover:border-gray-300 touch-manipulation"
                >
                  <div className="flex-shrink-0 p-2 rounded-full bg-green-100 peer-checked:bg-green-200">
                    <Camera className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-base md:text-lg">AI Camera</div>
                    <div className="text-sm text-gray-600 mt-1">Extract readings from photos automatically</div>
                  </div>
                  {readingMode === "ai_image" && (
                    <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                </label>
              </div>
            </RadioGroup>
            
            {/* Mobile-specific hint */}
            <div className="md:hidden">
              <div className="text-xs text-gray-500 text-center py-2 px-3 bg-blue-50 rounded-md border border-blue-200">
                💡 {readingMode === "manual" ? "Use the keyboard to type in values" : "Take a photo of gauges, meters, or displays"}
              </div>
            </div>
          </div>

          {/* AI Image Reader */}
          {readingMode === "ai_image" && (
            <AIImageReader
              onReadingsExtracted={handleReadingsExtracted}
              equipmentType={equipmentType}
            />
          )}

          {/* Extracted Readings Selection */}
          {readingMode === "ai_image" && extractedReadings.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Reading to Use</label>
              <div className="grid gap-2">
                {extractedReadings.map((reading, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded cursor-pointer transition-colors touch-manipulation min-h-[44px] ${
                      selectedReading === reading ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleReadingSelection(reading)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{reading.type}</span>
                      <div className="text-right">
                        <span className="text-lg">{reading.value} {reading.unit}</span>
                        <div className="text-xs text-gray-500">
                          {Math.round(reading.confidence * 100)}% confident
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reading Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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

              <Button 
                type="submit" 
                disabled={isSubmitting || (readingMode === "ai_image" && extractedReadings.length === 0)}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white touch-manipulation min-h-[52px] text-base font-semibold rounded-lg"
              >
                {isSubmitting 
                  ? (isOnline ? "Recording..." : "Saving Offline...") 
                  : (isOnline ? "Record Reading" : "Save Reading (Offline)")
                }
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualReadingEntry;

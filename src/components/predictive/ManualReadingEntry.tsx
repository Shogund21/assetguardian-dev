
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { offlineStorage } from "@/services/offlineStorageService";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import AIImageReader from "@/components/maintenance/form/AIImageReader";
import { ReadingModeSelector } from "./form/ReadingModeSelector";
import { ExtractedReadingsSelector } from "./form/ExtractedReadingsSelector";
import { ReadingForm } from "./form/ReadingForm";
import { EquipmentDebugInfo } from "./components/EquipmentDebugInfo";
import { ConnectionStatus } from "./components/ConnectionStatus";

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

  const detectedEquipmentType = equipmentType || 'general';
  const readingTemplate = getEquipmentReadingTemplate(detectedEquipmentType);

  console.log('🔧 ManualReadingEntry render:', {
    equipmentId,
    equipmentType,
    detectedEquipmentType,
    templateCount: readingTemplate.length,
    readingMode
  });

  const selectedReadingType = form.watch('reading_type');
  const templateReading = readingTemplate.find(t => t.type === selectedReadingType);

  useEffect(() => {
    if (templateReading?.unit && !form.getValues('unit')) {
      form.setValue('unit', templateReading.unit);
    }
  }, [templateReading, form]);

  const handleReadingsExtracted = (readings: ExtractedReading[], imageUrl: string) => {
    console.log('📷 AI readings extracted:', { count: readings.length });
    setExtractedReadings(readings);
    
    if (readings.length > 0) {
      const bestReading = readings.reduce((prev, current) => 
        (current.confidence > prev.confidence) ? current : prev
      );
      setSelectedReading(bestReading);
      
      // Auto-populate form
      form.setValue('reading_type', bestReading.type);
      form.setValue('value', bestReading.value);
      form.setValue('unit', bestReading.unit);
      if (bestReading.location) {
        form.setValue('location_notes', bestReading.location);
      }
    }
  };

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

        if (values.notes || values.location_notes) {
          await supabase.from('maintenance_documents').insert({
            equipment_id: values.equipment_id,
            file_name: `${readingMode === 'ai_image' ? 'AI Extracted' : 'Manual'} Reading - ${values.reading_type}`,
            file_path: 'manual_entry',
            file_type: 'text/plain',
            file_size: 0,
            category: 'manual_reading',
            comments: `${values.notes || ''}\nLocation Notes: ${values.location_notes || ''}`,
            tags: ['manual_reading', values.reading_type, readingMode],
          });
        }

        toast({
          title: "Success",
          description: `Reading recorded successfully via ${readingMode === 'ai_image' ? 'AI extraction' : 'manual entry'}`,
        });
      } else {
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
      console.error('❌ Error saving reading:', error);
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
    <div className="space-y-4 w-full min-h-screen mobile-form-container">
      <OfflineIndicator />
      
      <Card className="mobile-card w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            Record Reading
            <ConnectionStatus isOnline={isOnline} />
          </CardTitle>
          
          <EquipmentDebugInfo
            detectedEquipmentType={detectedEquipmentType}
            templateCount={readingTemplate.length}
            readingMode={readingMode}
            form={form}
          />
        </CardHeader>
        
        <CardContent className="space-y-6 w-full">
          {/* Mode selector - always visible */}
          <ReadingModeSelector
            readingMode={readingMode}
            onReadingModeChange={setReadingMode}
          />

          {/* AI Camera section - show when ai_image mode */}
          {readingMode === "ai_image" && (
            <div className="w-full mobile-form-field">
              <AIImageReader
                onReadingsExtracted={handleReadingsExtracted}
                equipmentType={detectedEquipmentType}
              />
            </div>
          )}

          {/* Extracted readings selector */}
          {readingMode === "ai_image" && extractedReadings.length > 0 && (
            <ExtractedReadingsSelector
              extractedReadings={extractedReadings}
              selectedReading={selectedReading}
              onReadingSelection={handleReadingSelection}
            />
          )}

          {/* Form - always visible */}
          <ReadingForm
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            isOnline={isOnline}
            readingMode={readingMode}
            readingTemplate={readingTemplate}
            extractedReadings={extractedReadings}
            templateReading={templateReading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualReadingEntry;

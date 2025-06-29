
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

  // Enhanced equipment type detection with explicit debugging
  const detectedEquipmentType = equipmentType || 'general';
  const readingTemplate = getEquipmentReadingTemplate(detectedEquipmentType);

  // Component mounting and debugging - REMOVED componentMounted delay
  useEffect(() => {
    console.log('🔧 ManualReadingEntry mounted:', {
      equipmentId,
      equipmentTypeProp: equipmentType,
      detectedEquipmentType,
      templateCount: readingTemplate.length,
      formDefaults: form.getValues()
    });

    // Special logging for chiller detection
    if (detectedEquipmentType === 'chiller') {
      console.log('🧊 Chiller detected - Template details:', {
        totalReadings: readingTemplate.length,
        sections: [...new Set(readingTemplate.map(t => t.section))],
        sampleReadings: readingTemplate.slice(0, 5).map(t => ({ 
          type: t.type, 
          label: t.label, 
          section: t.section,
          unit: t.unit 
        }))
      });
    }
  }, [equipmentId, equipmentType, detectedEquipmentType, readingTemplate.length]);

  // Watch for reading type changes to auto-populate unit
  const selectedReadingType = form.watch('reading_type');
  const templateReading = readingTemplate.find(t => t.type === selectedReadingType);

  // Auto-populate unit when reading type changes
  useEffect(() => {
    if (templateReading?.unit && !form.getValues('unit')) {
      form.setValue('unit', templateReading.unit);
      console.log('🔄 Auto-populated unit:', templateReading.unit);
    }
  }, [templateReading, form]);

  // Handle AI image readings extraction
  const handleReadingsExtracted = (readings: ExtractedReading[], imageUrl: string) => {
    console.log('📷 AI readings extracted:', readings.length);
    setExtractedReadings(readings);
    if (readings.length > 0) {
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

  const handleReadingSelection = (reading: ExtractedReading) => {
    console.log('📝 Reading selected:', reading.type);
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
      console.log('💾 Submitting reading:', { ...values, readingMode, isOnline });
      
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
        description: isOnline ? "Failed to save reading" : "Failed to save reading offline",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // REMOVED componentMounted check - render immediately
  return (
    <div className="space-y-4 w-full">
      <OfflineIndicator />
      
      <Card className="mobile-card w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            Record Reading
            <div className="text-sm font-normal flex items-center gap-2">
              {isOnline ? (
                <span className="text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online
                </span>
              ) : (
                <span className="text-orange-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Offline
                </span>
              )}
            </div>
          </CardTitle>
          
          {/* Enhanced mobile-friendly debug info */}
          <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg border-2 border-blue-200">
            <div className="flex justify-between">
              <span>Equipment Type:</span>
              <span className="font-bold text-blue-600">{detectedEquipmentType}</span>
            </div>
            <div className="flex justify-between">
              <span>Template Readings:</span>
              <span className={`font-bold ${readingTemplate.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {readingTemplate.length}
              </span>
            </div>
            {detectedEquipmentType === 'chiller' && readingTemplate.length > 0 && (
              <div className="text-green-600 text-center font-bold bg-green-100 p-2 rounded border">
                ✅ Chiller template loaded ({readingTemplate.length} readings)
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 w-full">
          {/* ALWAYS render ReadingModeSelector - highest priority */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300 w-full min-h-[120px] flex flex-col">
            <div className="text-sm font-bold text-blue-800 mb-2">📱 Recording Method</div>
            <ReadingModeSelector
              readingMode={readingMode}
              onReadingModeChange={setReadingMode}
            />
          </div>

          {/* AI Image Reader - only show when AI mode is selected */}
          {readingMode === "ai_image" && (
            <div className="border-t-2 border-gray-200 pt-4 w-full">
              <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200 mb-4">
                <div className="text-green-800 font-bold">📷 AI Camera Mode Active</div>
              </div>
              <AIImageReader
                onReadingsExtracted={handleReadingsExtracted}
                equipmentType={detectedEquipmentType}
              />
            </div>
          )}

          {/* Extracted Readings Selection - only show when we have AI readings */}
          {readingMode === "ai_image" && extractedReadings.length > 0 && (
            <div className="border-t-2 border-gray-200 pt-4 w-full">
              <ExtractedReadingsSelector
                extractedReadings={extractedReadings}
                selectedReading={selectedReading}
                onReadingSelection={handleReadingSelection}
              />
            </div>
          )}

          {/* Reading Form - ALWAYS show with enhanced visibility */}
          <div className="border-t-2 border-gray-200 pt-4 w-full">
            <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200 mb-4">
              <div className="text-purple-800 font-bold">📝 Reading Form</div>
              <div className="text-xs text-purple-600">Templates: {readingTemplate.length} | Mode: {readingMode}</div>
            </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualReadingEntry;

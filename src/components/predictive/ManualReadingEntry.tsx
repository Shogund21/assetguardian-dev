
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

  // Component debugging - simplified
  useEffect(() => {
    console.log('🔧 ManualReadingEntry render state:', {
      equipmentId,
      equipmentType,
      detectedEquipmentType,
      templateCount: readingTemplate.length,
      readingMode,
      formMounted: !!form
    });
  }, [equipmentId, equipmentType, detectedEquipmentType, readingTemplate.length, readingMode]);

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

  // Force render with debugging
  console.log('🎨 ManualReadingEntry about to render with:', {
    templateCount: readingTemplate.length,
    readingMode,
    extractedCount: extractedReadings.length
  });

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
          
          {/* Debug info with enhanced visibility */}
          <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded-lg border-2 border-blue-300">
            <div className="flex justify-between">
              <span>Equipment Type:</span>
              <span className="font-bold text-blue-700">{detectedEquipmentType}</span>
            </div>
            <div className="flex justify-between">
              <span>Template Readings:</span>
              <span className={`font-bold ${readingTemplate.length > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {readingTemplate.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Current Mode:</span>
              <span className="font-bold text-purple-700">{readingMode}</span>
            </div>
            {detectedEquipmentType === 'chiller' && readingTemplate.length > 0 && (
              <div className="text-green-700 text-center font-bold bg-green-200 p-2 rounded border">
                ✅ Chiller template active ({readingTemplate.length} readings available)
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 w-full">
          {/* PHASE 1: Always render ReadingModeSelector with visibility debug */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 w-full">
            <div className="text-purple-800 font-bold mb-2">🎛️ RECORDING METHOD SELECTOR</div>
            <div className="text-xs text-purple-600 mb-3">Status: Always visible | Mode: {readingMode}</div>
            <ReadingModeSelector
              readingMode={readingMode}
              onReadingModeChange={(mode) => {
                console.log('🔄 Mode changed to:', mode);
                setReadingMode(mode);
              }}
            />
          </div>

          {/* PHASE 2: AI Image Reader with better visibility */}
          {readingMode === "ai_image" && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 w-full">
              <div className="text-green-800 font-bold mb-2">📷 AI CAMERA SECTION</div>
              <AIImageReader
                onReadingsExtracted={handleReadingsExtracted}
                equipmentType={detectedEquipmentType}
              />
            </div>
          )}

          {/* PHASE 3: Extracted Readings Selection */}
          {readingMode === "ai_image" && extractedReadings.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 w-full">
              <div className="text-yellow-800 font-bold mb-2">📋 EXTRACTED READINGS</div>
              <ExtractedReadingsSelector
                extractedReadings={extractedReadings}
                selectedReading={selectedReading}
                onReadingSelection={handleReadingSelection}
              />
            </div>
          )}

          {/* PHASE 4: Enhanced Reading Form with visibility debugging */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 w-full">
            <div className="text-blue-800 font-bold mb-2">📝 READING FORM SECTION</div>
            <div className="text-xs text-blue-600 mb-3">
              Templates: {readingTemplate.length} | Form Ready: {form ? '✅' : '❌'}
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

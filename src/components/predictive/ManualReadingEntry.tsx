
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
  const [renderError, setRenderError] = useState<string | null>(null);
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

  // Enhanced equipment type detection with comprehensive error handling
  const detectedEquipmentType = equipmentType || 'general';
  const readingTemplate = getEquipmentReadingTemplate(detectedEquipmentType);

  // Component initialization logging
  useEffect(() => {
    try {
      console.log('🔧 ManualReadingEntry initialization - ENHANCED:', {
        equipmentId,
        equipmentType,
        detectedEquipmentType,
        templateCount: readingTemplate.length,
        readingMode,
        formReady: !!form,
        timestamp: new Date().toISOString()
      });

      // Validate critical dependencies
      if (!form) {
        throw new Error('Form not properly initialized');
      }
      if (!readingTemplate) {
        console.warn('⚠️ No reading template found for:', detectedEquipmentType);
      }

      setRenderError(null);
    } catch (error) {
      console.error('❌ ManualReadingEntry initialization error:', error);
      setRenderError(error instanceof Error ? error.message : 'Unknown initialization error');
    }
  }, [equipmentId, equipmentType, detectedEquipmentType, readingTemplate.length, readingMode, form]);

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
    try {
      console.log('📷 AI readings extracted - ENHANCED:', {
        count: readings.length,
        imageUrl: imageUrl ? 'present' : 'missing',
        readings: readings.map(r => ({ type: r.type, confidence: r.confidence }))
      });
      
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
        
        console.log('✅ Form auto-populated with best reading:', bestReading.type);
      }
    } catch (error) {
      console.error('❌ Error handling extracted readings:', error);
      toast({
        title: "Error",
        description: "Failed to process extracted readings",
        variant: "destructive",
      });
    }
  };

  const handleReadingSelection = (reading: ExtractedReading) => {
    try {
      console.log('📝 Reading selected - ENHANCED:', {
        type: reading.type,
        value: reading.value,
        confidence: reading.confidence
      });
      
      setSelectedReading(reading);
      form.setValue('reading_type', reading.type);
      form.setValue('value', reading.value);
      form.setValue('unit', reading.unit);
      if (reading.location) {
        form.setValue('location_notes', reading.location);
      }
    } catch (error) {
      console.error('❌ Error selecting reading:', error);
      toast({
        title: "Error",
        description: "Failed to select reading",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: ReadingFormValues) => {
    setIsSubmitting(true);
    try {
      const timestamp = new Date().toISOString();
      console.log('💾 Submitting reading - ENHANCED:', { 
        ...values, 
        readingMode, 
        isOnline,
        templateCount: readingTemplate.length
      });
      
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
      console.error('❌ Error saving reading - ENHANCED:', error);
      toast({
        title: "Error",
        description: isOnline ? "Failed to save reading" : "Failed to save reading offline",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error boundary render
  if (renderError) {
    return (
      <div className="space-y-4 w-full">
        <Card className="mobile-card w-full border-red-500">
          <CardHeader>
            <CardTitle className="text-red-700">⚠️ Component Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600 space-y-2">
              <p>Error: {renderError}</p>
              <p className="text-sm">Please refresh the page to restore functionality.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main render with enhanced error boundaries
  try {
    console.log('🎨 ManualReadingEntry render - ENHANCED:', {
      templateCount: readingTemplate.length,
      readingMode,
      extractedCount: extractedReadings.length,
      hasForm: !!form,
      renderTime: new Date().toISOString()
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
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Online
                  </span>
                ) : (
                  <span className="text-orange-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    Offline
                  </span>
                )}
              </div>
            </CardTitle>
            
            {/* Enhanced debug info with better visibility */}
            <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded-lg border-2 border-blue-300">
              <div className="text-blue-800 font-bold mb-2">🔧 COMPONENT STATUS - ENHANCED</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Equipment:</span>
                  <span className="font-bold text-blue-700">{detectedEquipmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Templates:</span>
                  <span className={`font-bold ${readingTemplate.length > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {readingTemplate.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="font-bold text-purple-700">{readingMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Form:</span>
                  <span className="font-bold text-green-700">{form ? '✅' : '❌'}</span>
                </div>
              </div>
              {detectedEquipmentType === 'chiller' && readingTemplate.length > 0 && (
                <div className="text-green-700 text-center font-bold bg-green-200 p-2 rounded border mt-2">
                  ✅ Chiller template active ({readingTemplate.length} readings available)
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 w-full">
            {/* PHASE 1: Always render ReadingModeSelector with enhanced visibility */}
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 w-full">
              <div className="text-purple-800 font-bold mb-2">🎛️ RECORDING METHOD SELECTOR - ENHANCED</div>
              <div className="text-xs text-purple-600 mb-3">
                Status: ✅ Always visible | Current: {readingMode} | Time: {new Date().toLocaleTimeString()}
              </div>
              <ReadingModeSelector
                readingMode={readingMode}
                onReadingModeChange={(mode) => {
                  console.log('🔄 Mode change request:', { from: readingMode, to: mode });
                  setReadingMode(mode);
                }}
              />
            </div>

            {/* PHASE 2: AI Image Reader with enhanced error boundary */}
            {readingMode === "ai_image" && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 w-full">
                <div className="text-green-800 font-bold mb-2">📷 AI CAMERA SECTION - ENHANCED</div>
                <div className="text-xs text-green-600 mb-3">
                  Status: ✅ Active | Ready for photo capture
                </div>
                <AIImageReader
                  onReadingsExtracted={handleReadingsExtracted}
                  equipmentType={detectedEquipmentType}
                />
              </div>
            )}

            {/* PHASE 3: Extracted Readings Selection with enhanced UI */}
            {readingMode === "ai_image" && extractedReadings.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 w-full">
                <div className="text-yellow-800 font-bold mb-2">📋 EXTRACTED READINGS - ENHANCED</div>
                <div className="text-xs text-yellow-600 mb-3">
                  Found: {extractedReadings.length} readings | Selected: {selectedReading?.type || 'none'}
                </div>
                <ExtractedReadingsSelector
                  extractedReadings={extractedReadings}
                  selectedReading={selectedReading}
                  onReadingSelection={handleReadingSelection}
                />
              </div>
            )}

            {/* PHASE 4: Enhanced Reading Form with comprehensive error handling */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 w-full">
              <div className="text-blue-800 font-bold mb-2">📝 READING FORM SECTION - ENHANCED</div>
              <div className="text-xs text-blue-600 mb-3 grid grid-cols-2 gap-2">
                <div>Templates: {readingTemplate.length}</div>
                <div>Form: {form ? '✅ Ready' : '❌ Error'}</div>
                <div>Mode: {readingMode}</div>
                <div>Status: Rendering</div>
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
        
        {/* Render success confirmation */}
        <div className="bg-green-100 p-3 rounded-lg border-2 border-green-400 text-center">
          <div className="text-green-800 font-bold">✅ MANUAL READING ENTRY RENDERED SUCCESSFULLY</div>
          <div className="text-xs text-green-700 mt-1">
            All components loaded | {readingTemplate.length} templates | Mode: {readingMode}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ CRITICAL ERROR in ManualReadingEntry render:', error);
    setRenderError(error instanceof Error ? error.message : 'Unknown render error');
    return null;
  }
};

export default ManualReadingEntry;

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
  const [debugPhase, setDebugPhase] = useState(1);
  const { toast } = useToast();
  const { isOnline, updateUnsyncedCount } = useOfflineSync();

  // Debug viewport and container info
  useEffect(() => {
    console.log('🔍 PHASE 1 - CONTAINER DEBUG:', {
      windowInnerHeight: window.innerHeight,
      windowInnerWidth: window.innerWidth,
      documentBodyHeight: document.body.scrollHeight,
      documentBodyWidth: document.body.scrollWidth,
      timestamp: new Date().toISOString()
    });

    // Check for problematic CSS on parent containers
    const tabsContent = document.querySelector('[data-state="active"]');
    const mainContainer = document.querySelector('.min-h-screen');
    const cardElements = document.querySelectorAll('.mobile-card');

    console.log('🔍 CONTAINER ANALYSIS:', {
      tabsContentExists: !!tabsContent,
      tabsContentStyles: tabsContent ? window.getComputedStyle(tabsContent) : null,
      mainContainerExists: !!mainContainer,
      mainContainerStyles: mainContainer ? {
        overflow: window.getComputedStyle(mainContainer).overflow,
        height: window.getComputedStyle(mainContainer).height,
        maxHeight: window.getComputedStyle(mainContainer).maxHeight,
        position: window.getComputedStyle(mainContainer).position
      } : null,
      cardElementsCount: cardElements.length
    });
  }, []);

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

  useEffect(() => {
    console.log('🔧 ManualReadingEntry initialization:', {
      equipmentId,
      equipmentType,
      detectedEquipmentType,
      templateCount: readingTemplate.length,
      readingMode,
      debugPhase
    });
  }, [equipmentId, equipmentType, detectedEquipmentType, readingTemplate.length, readingMode, debugPhase]);

  const selectedReadingType = form.watch('reading_type');
  const templateReading = readingTemplate.find(t => t.type === selectedReadingType);

  useEffect(() => {
    if (templateReading?.unit && !form.getValues('unit')) {
      form.setValue('unit', templateReading.unit);
    }
  }, [templateReading, form]);

  const handleReadingsExtracted = (readings: ExtractedReading[], imageUrl: string) => {
    try {
      console.log('📷 AI readings extracted:', { count: readings.length });
      setExtractedReadings(readings);

      if (readings.length > 0) {
        const bestReading = readings.reduce((prev, current) =>
          (current.confidence > prev.confidence) ? current : prev
        );
        setSelectedReading(bestReading);

        form.setValue('reading_type', bestReading.type);
        form.setValue('value', bestReading.value);
        form.setValue('unit', bestReading.unit);
        if (bestReading.location) {
          form.setValue('location_notes', bestReading.location);
        }
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
      setSelectedReading(reading);
      form.setValue('reading_type', reading.type);
      form.setValue('value', reading.value);
      form.setValue('unit', reading.unit);
      if (reading.location) {
        form.setValue('location_notes', reading.location);
      }
    } catch (error) {
      console.error('❌ Error selecting reading:', error);
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

  // Render different phases of debugging
  const renderDebugPhase = () => {
    switch (debugPhase) {
      case 1:
        return (
          <div className="space-y-4 w-full min-h-screen overflow-visible border-4 border-yellow-400 bg-yellow-50">
            <div className="text-yellow-800 font-bold text-center p-4 bg-yellow-200 border border-yellow-600">
              🔍 PHASE 1: Container CSS Investigation (Yellow Border = Main Container)
            </div>
            
            <OfflineIndicator />

            <Card className="mobile-card w-full border-4 border-red-500 bg-red-50 overflow-visible">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Record Reading
                  <ConnectionStatus isOnline={isOnline} />
                </CardTitle>
                <div className="text-red-800 font-bold bg-red-200 p-2 border border-red-600">
                  🔍 Red Border = Card Container
                </div>
                <EquipmentDebugInfo
                  detectedEquipmentType={detectedEquipmentType}
                  templateCount={readingTemplate.length}
                  readingMode={readingMode}
                  form={form}
                />
              </CardHeader>

              <CardContent className="space-y-6 w-full border-2 border-blue-400 bg-blue-50 overflow-visible">
                <div className="text-blue-800 font-bold bg-blue-200 p-2 border border-blue-600">
                  🔍 Blue Border = CardContent
                </div>
                
                <ReadingModeSelector
                  readingMode={readingMode}
                  onReadingModeChange={setReadingMode}
                />

                {readingMode === "ai_image" && (
                  <div className="border-2 border-green-500 bg-green-50">
                    <div className="text-green-800 font-bold bg-green-200 p-2 border border-green-600">
                      🔍 Green Border = AI Image Section
                    </div>
                    <AIImageReader
                      onReadingsExtracted={handleReadingsExtracted}
                      equipmentType={detectedEquipmentType}
                    />
                  </div>
                )}

                {readingMode === "ai_image" && extractedReadings.length > 0 && (
                  <ExtractedReadingsSelector
                    extractedReadings={extractedReadings}
                    selectedReading={selectedReading}
                    onReadingSelection={handleReadingSelection}
                  />
                )}

                <div className="border-2 border-purple-400 bg-purple-50 min-h-[400px] overflow-visible">
                  <div className="text-purple-800 font-bold bg-purple-200 p-2 border border-purple-600">
                    🔍 Purple Border = ReadingForm Container
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
                
                <button 
                  onClick={() => setDebugPhase(2)}
                  className="w-full bg-orange-500 text-white p-4 font-bold rounded border-2 border-orange-700"
                >
                  🚀 SWITCH TO PHASE 2: Force Visibility Test
                </button>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="fixed inset-0 z-[9999] bg-pink-100 border-8 border-pink-600 overflow-auto">
            <div className="text-pink-800 font-bold text-center p-4 bg-pink-200 border-b-4 border-pink-600">
              🚀 PHASE 2: FORCE VISIBILITY TEST (Fixed Position, Max Z-Index)
            </div>
            
            <div className="p-4 space-y-4">
              <div className="bg-pink-200 p-4 border-2 border-pink-500 rounded">
                <div className="font-bold text-pink-800 mb-2">Visibility Test Results:</div>
                <div className="text-sm text-pink-700">
                  ✅ If you can see this, the component CAN render<br/>
                  ✅ If form appears below, it's a layering/container issue<br/>
                  ❌ If form still missing, it's a React rendering issue
                </div>
              </div>

              <div className="bg-white p-4 border-4 border-indigo-600 rounded min-h-[300px]">
                <div className="text-indigo-800 font-bold bg-indigo-100 p-2 border border-indigo-400 mb-4">
                  🔍 Force-Visible ReadingForm (Indigo Border)
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

              <button 
                onClick={() => setDebugPhase(3)}
                className="w-full bg-teal-500 text-white p-4 font-bold rounded border-2 border-teal-700"
              >
                🔍 SWITCH TO PHASE 3: Simplified Test
              </button>
              
              <button 
                onClick={() => setDebugPhase(1)}
                className="w-full bg-gray-500 text-white p-4 font-bold rounded border-2 border-gray-700"
              >
                ⬅️ Back to Phase 1
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="w-full min-h-screen bg-emerald-100 border-8 border-emerald-600 p-4">
            <div className="text-emerald-800 font-bold text-center p-4 bg-emerald-200 border-b-4 border-emerald-600 mb-4">
              🔍 PHASE 3: SIMPLIFIED COMPONENT TEST
            </div>
            
            <div className="space-y-4">
              <div className="bg-emerald-200 p-4 border-2 border-emerald-500 rounded">
                <div className="font-bold text-emerald-800 mb-2">Simple Form Test:</div>
                <div className="text-sm text-emerald-700">
                  Testing if basic form elements can render at all
                </div>
              </div>

              {/* Ultra-simple form test */}
              <div className="bg-white p-6 border-4 border-red-500 rounded">
                <h3 className="text-xl font-bold text-red-800 mb-4">📝 SIMPLE FORM TEST</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Test Input:</label>
                    <input 
                      type="text" 
                      placeholder="Type here to test input"
                      className="w-full p-3 border-2 border-gray-300 rounded text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Test Select:</label>
                    <select className="w-full p-3 border-2 border-gray-300 rounded text-lg">
                      <option>Option 1</option>
                      <option>Option 2</option>
                    </select>
                  </div>
                  <button 
                    type="button"
                    className="w-full bg-blue-500 text-white p-4 rounded text-lg font-bold"
                  >
                    Test Button
                  </button>
                </form>
              </div>

              <button 
                onClick={() => setDebugPhase(1)}
                className="w-full bg-gray-500 text-white p-4 font-bold rounded border-2 border-gray-700"
              >
                ⬅️ Back to Phase 1
              </button>
            </div>
          </div>
        );

      default:
        return <div>Unknown debug phase</div>;
    }
  };

  console.log('🎨 About to render ManualReadingEntry, debugPhase:', debugPhase);

  return renderDebugPhase();
};

export default ManualReadingEntry;

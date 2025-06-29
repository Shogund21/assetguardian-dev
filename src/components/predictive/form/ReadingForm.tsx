
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ReadingFormFields } from "./ReadingFormFields";

interface ReadingTemplate {
  type: string;
  label: string;
  unit: string;
}

interface ExtractedReading {
  type: string;
  value: string;
  unit: string;
  confidence: number;
  location?: string;
}

interface ReadingFormProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
  isOnline: boolean;
  readingMode: "manual" | "ai_image";
  readingTemplate: ReadingTemplate[];
  extractedReadings: ExtractedReading[];
  templateReading?: ReadingTemplate;
}

export const ReadingForm = ({
  form,
  onSubmit,
  isSubmitting,
  isOnline,
  readingMode,
  readingTemplate,
  extractedReadings,
  templateReading
}: ReadingFormProps) => {
  console.log('📝 ReadingForm rendering with enhanced debugging:', { 
    readingMode, 
    templateCount: readingTemplate.length,
    extractedCount: extractedReadings.length,
    hasForm: !!form
  });

  return (
    <div className="w-full space-y-4 bg-white p-4 rounded-lg border-2 border-gray-300">
      {/* PHASE 1: Form Debug Info */}
      <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
        <div className="text-blue-800 font-bold">🔍 FORM DEBUG STATUS</div>
        <div className="text-xs text-blue-700 space-y-1 mt-2">
          <div>Form object: {form ? '✅ Ready' : '❌ Missing'}</div>
          <div>Templates: {readingTemplate.length}</div>
          <div>Mode: {readingMode}</div>
          <div>Submitting: {isSubmitting ? '⏳' : '✅'}</div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
          {/* PHASE 2: Enhanced form fields with error boundary */}
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
            <div className="text-gray-800 font-bold mb-3">📋 FORM FIELDS SECTION</div>
            <ReadingFormFields
              control={form.control}
              readingTemplate={readingTemplate}
              readingMode={readingMode}
              extractedReadings={extractedReadings}
              templateReading={templateReading}
            />
          </div>

          {/* PHASE 3: Enhanced submit button with better mobile handling */}
          <div className="sticky bottom-0 bg-white p-4 border-4 border-blue-300 rounded-lg shadow-lg -mx-4 mt-6">
            <div className="bg-blue-100 p-2 rounded mb-3">
              <div className="text-blue-800 font-bold text-sm">🚀 SUBMIT SECTION</div>
              <div className="text-xs text-blue-700">
                Ready: {!isSubmitting && (readingMode === "manual" || extractedReadings.length > 0) ? '✅' : '❌'}
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || (readingMode === "ai_image" && extractedReadings.length === 0)}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white touch-manipulation min-h-[56px] text-lg font-bold rounded-lg shadow-xl border-2 border-blue-700"
            >
              {isSubmitting 
                ? (isOnline ? "🔄 Recording..." : "💾 Saving Offline...") 
                : (isOnline ? "📊 Record Reading" : "💾 Save Reading (Offline)")
              }
            </Button>
            
            {readingMode === "ai_image" && extractedReadings.length === 0 && (
              <p className="text-sm text-orange-600 text-center mt-2 font-medium">
                📷 Take a photo first to enable submit
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};


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
  console.log('📝 ReadingForm render:', { 
    readingMode, 
    templateCount: readingTemplate.length,
    hasForm: !!form,
    timestamp: new Date().toISOString()
  });

  if (!form) {
    return (
      <div className="w-full p-6 bg-gray-50 border-2 border-gray-200 rounded-lg">
        <div className="text-gray-700 font-bold text-center mb-4">⚠️ Form Loading</div>
        <div className="text-gray-600 text-sm text-center">
          Please wait while the form initializes...
        </div>
      </div>
    );
  }

  const canSubmit = !isSubmitting && (readingMode === "manual" || extractedReadings.length > 0);

  return (
    <div className="w-full space-y-4 bg-white mobile-form-container predictive-form">
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-6 w-full"
          noValidate
        >
          {/* Form fields - always rendered */}
          <div className="bg-white p-2">
            <ReadingFormFields
              control={form.control}
              readingTemplate={readingTemplate}
              readingMode={readingMode}
              extractedReadings={extractedReadings}
              templateReading={templateReading}
            />
          </div>

          {/* Mobile-optimized submit section */}
          <div className="sticky bottom-0 bg-white p-4 border border-gray-200 rounded-lg shadow-lg mt-6 mobile-form-field">
            <div className="bg-blue-50 p-3 rounded mb-3 border border-blue-200">
              <div className="text-blue-800 font-bold text-sm">🚀 Submit Reading</div>
              <div className="text-xs text-blue-700 grid grid-cols-2 gap-2 mt-2">
                <div>Ready: {canSubmit ? '✅' : '❌'}</div>
                <div>Online: {isOnline ? '🌐' : '📱'}</div>
                <div>Mode: {readingMode}</div>
                <div>Templates: {readingTemplate.length}</div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={!canSubmit}
              className={`mobile-submit-button hover:bg-blue-800 text-white touch-manipulation transition-all duration-200 ${
                canSubmit 
                  ? 'bg-blue-900 border-blue-700 hover:shadow-2xl' 
                  : 'bg-gray-400 border-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting 
                ? (isOnline ? "🔄 Recording..." : "💾 Saving Offline...") 
                : (isOnline ? "📊 Record Reading" : "💾 Save Reading (Offline)")
              }
            </Button>
            
            {/* Status messages */}
            {readingMode === "ai_image" && extractedReadings.length === 0 && (
              <div className="text-sm text-orange-600 text-center mt-3 p-2 bg-orange-100 rounded border border-orange-300">
                📷 Take a photo first to enable submit
              </div>
            )}
            
            {!canSubmit && readingMode === "manual" && (
              <div className="text-sm text-blue-600 text-center mt-3 p-2 bg-blue-100 rounded border border-blue-300">
                📝 Fill out required fields to enable submit
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};


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
  console.log('📝 ReadingForm render - ENHANCED TRACKING:', { 
    readingMode, 
    templateCount: readingTemplate.length,
    extractedCount: extractedReadings.length,
    hasForm: !!form,
    formValid: form ? !Object.keys(form.formState.errors).length : false,
    formErrors: form ? Object.keys(form.formState.errors) : []
  });

  // Form validation check
  const isFormReady = form && typeof form.handleSubmit === 'function';
  const canSubmit = !isSubmitting && (readingMode === "manual" || extractedReadings.length > 0);

  if (!isFormReady) {
    console.error('🚨 CRITICAL: Form not ready for rendering');
    return (
      <div className="w-full p-6 bg-red-50 border-2 border-red-500 rounded-lg">
        <div className="text-red-800 font-bold text-center mb-4">⚠️ FORM ERROR</div>
        <div className="text-red-700 text-sm text-center">
          Form object is not properly initialized. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 bg-white p-4 rounded-lg border-2 border-gray-300">
      {/* Enhanced Form Debug Info */}
      <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
        <div className="text-blue-800 font-bold">🔍 READING FORM DEBUG - ENHANCED</div>
        <div className="text-xs text-blue-700 space-y-1 mt-2">
          <div>✅ Form object: {form ? 'READY' : '❌ MISSING'}</div>
          <div>✅ Templates: {readingTemplate.length}</div>
          <div>✅ Mode: {readingMode}</div>
          <div>✅ Submitting: {isSubmitting ? '⏳ IN PROGRESS' : '✅ READY'}</div>
          <div>✅ Can Submit: {canSubmit ? '✅ YES' : '❌ NO'}</div>
          <div>✅ Form Errors: {Object.keys(form.formState.errors).length}</div>
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="text-red-600 bg-red-100 p-1 rounded text-xs">
              Errors: {Object.keys(form.formState.errors).join(', ')}
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-6 w-full"
          noValidate
        >
          {/* Enhanced form fields with error boundary */}
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
            <div className="text-gray-800 font-bold mb-3">📋 FORM FIELDS SECTION - ENHANCED</div>
            <div className="text-xs text-gray-600 mb-3">
              Status: Rendering {readingTemplate.length} templates in {readingMode} mode
            </div>
            
            <ReadingFormFields
              control={form.control}
              readingTemplate={readingTemplate}
              readingMode={readingMode}
              extractedReadings={extractedReadings}
              templateReading={templateReading}
            />
          </div>

          {/* Enhanced submit section with better mobile handling */}
          <div className="sticky bottom-0 bg-white p-4 border-4 border-blue-300 rounded-lg shadow-xl -mx-4 mt-6">
            <div className="bg-blue-100 p-3 rounded mb-3">
              <div className="text-blue-800 font-bold text-sm">🚀 SUBMIT SECTION - ENHANCED</div>
              <div className="text-xs text-blue-700 grid grid-cols-2 gap-2 mt-2">
                <div>Ready: {canSubmit ? '✅ YES' : '❌ NO'}</div>
                <div>Online: {isOnline ? '🌐 YES' : '📱 OFFLINE'}</div>
                <div>Mode: {readingMode}</div>
                <div>Extracted: {extractedReadings.length}</div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={!canSubmit}
              className={`w-full hover:bg-blue-800 text-white touch-manipulation min-h-[56px] text-lg font-bold rounded-lg shadow-xl border-2 transition-all duration-200 ${
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
            
            {/* Enhanced status messages */}
            {readingMode === "ai_image" && extractedReadings.length === 0 && (
              <div className="text-sm text-orange-600 text-center mt-3 p-2 bg-orange-100 rounded border border-orange-300">
                📷 Take a photo first to enable submit
              </div>
            )}
            
            {!canSubmit && readingMode === "manual" && (
              <div className="text-sm text-blue-600 text-center mt-3 p-2 bg-blue-100 rounded border border-blue-300">
                📝 Fill out the form fields above to enable submit
              </div>
            )}
            
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="text-sm text-red-600 text-center mt-3 p-2 bg-red-100 rounded border border-red-300">
                ⚠️ Please fix form errors: {Object.keys(form.formState.errors).join(', ')}
              </div>
            )}
          </div>
        </form>
      </Form>
      
      {/* Final render confirmation */}
      <div className="bg-green-100 p-3 rounded-lg border border-green-400 text-center">
        <div className="text-green-800 font-bold">✅ READING FORM RENDERED SUCCESSFULLY</div>
        <div className="text-xs text-green-700 mt-1">
          Form ready | {readingTemplate.length} templates | Mode: {readingMode}
        </div>
      </div>
    </div>
  );
};

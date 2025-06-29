
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
  console.log('📝 ReadingForm rendering:', { 
    readingMode, 
    templateCount: readingTemplate.length,
    extractedCount: extractedReadings.length 
  });

  return (
    <div className="w-full space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
          <ReadingFormFields
            control={form.control}
            readingTemplate={readingTemplate}
            readingMode={readingMode}
            extractedReadings={extractedReadings}
            templateReading={templateReading}
          />

          <div className="sticky bottom-0 bg-white p-4 border-t-2 border-gray-200 -mx-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || (readingMode === "ai_image" && extractedReadings.length === 0)}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white touch-manipulation min-h-[52px] text-base font-bold rounded-lg shadow-lg"
            >
              {isSubmitting 
                ? (isOnline ? "Recording..." : "Saving Offline...") 
                : (isOnline ? "Record Reading" : "Save Reading (Offline)")
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};


import React from "react";
import { Control } from "react-hook-form";
import { ReadingTypeField } from "./fields/ReadingTypeField";
import { ValueField } from "./fields/ValueField";
import { UnitField } from "./fields/UnitField";
import { NotesFields } from "./fields/NotesFields";

interface ReadingTemplate {
  type: string;
  label: string;
  unit: string;
  section?: string;
  description?: string;
}

interface ReadingFormFieldsProps {
  control: Control<any>;
  readingTemplate: ReadingTemplate[];
  readingMode: "manual" | "ai_image";
  extractedReadings: any[];
  templateReading?: ReadingTemplate;
}

export const ReadingFormFields = ({
  control,
  readingTemplate,
  readingMode,
  extractedReadings,
  templateReading
}: ReadingFormFieldsProps) => {
  console.log('🎨 ReadingFormFields render:', {
    templateCount: readingTemplate.length,
    readingMode,
    extractedCount: extractedReadings.length,
    hasControl: !!control,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="space-y-6 w-full bg-white p-4 rounded-lg border border-gray-200 mobile-form-container predictive-form">
      {/* Simple status display */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="text-blue-800 font-bold">📋 Form Status</div>
        <div className="text-xs text-blue-700 space-y-1 mt-2">
          <div>✅ Templates: {readingTemplate.length}</div>
          <div>✅ Mode: {readingMode}</div>
          <div>✅ Ready to input</div>
        </div>
      </div>

      {/* Form fields with clean styling */}
      <div className="space-y-4">
        <ReadingTypeField
          control={control}
          readingTemplate={readingTemplate}
          readingMode={readingMode}
          extractedReadings={extractedReadings}
          groupedReadings={readingTemplate.reduce((acc, reading) => {
            const section = reading.section || 'General';
            if (!acc[section]) acc[section] = [];
            acc[section].push(reading);
            return acc;
          }, {} as Record<string, ReadingTemplate[]>)}
        />

        <ValueField control={control} />

        <UnitField 
          control={control}
          templateReading={templateReading}
          readingMode={readingMode}
        />

        <NotesFields control={control} />
      </div>

      {/* Confirmation */}
      <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
        <div className="text-green-800 font-bold">✅ Form Fields Ready</div>
        <div className="text-xs text-green-700 mt-1">
          {readingTemplate.length} templates | {readingMode} mode
        </div>
      </div>
    </div>
  );
};

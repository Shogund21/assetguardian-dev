
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
    <div className="space-y-6 w-full bg-white p-4 rounded-lg border-2 border-gray-300 mobile-form-container predictive-form">
      <div className="text-pink-500 text-sm font-bold bg-pink-100 p-2 border border-pink-300">
        🔍 DEBUG: ReadingFormFields Started
      </div>

      {/* Simple status display */}
      <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
        <div className="text-blue-800 font-bold">📋 Form Status</div>
        <div className="text-xs text-blue-700 space-y-1 mt-2">
          <div>✅ Templates: {readingTemplate.length}</div>
          <div>✅ Mode: {readingMode}</div>
          <div>✅ Ready to input</div>
        </div>
      </div>

      <div className="text-purple-500 text-sm font-bold bg-purple-100 p-2 border border-purple-300">
        ⬇️ DEBUG: ReadingTypeField Below
      </div>

      {/* Always show all form fields */}
      <div className="border-2 border-purple-300 p-2 bg-purple-50">
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
      </div>

      <div className="text-teal-500 text-sm font-bold bg-teal-100 p-2 border border-teal-300">
        ⬇️ DEBUG: ValueField Below
      </div>

      <div className="border-2 border-teal-300 p-2 bg-teal-50">
        <ValueField control={control} />
      </div>

      <div className="text-amber-500 text-sm font-bold bg-amber-100 p-2 border border-amber-300">
        ⬇️ DEBUG: UnitField Below
      </div>

      <div className="border-2 border-amber-300 p-2 bg-amber-50">
        <UnitField 
          control={control}
          templateReading={templateReading}
          readingMode={readingMode}
        />
      </div>

      <div className="text-rose-500 text-sm font-bold bg-rose-100 p-2 border border-rose-300">
        ⬇️ DEBUG: NotesFields Below
      </div>

      <div className="border-2 border-rose-300 p-2 bg-rose-50">
        <NotesFields control={control} />
      </div>

      {/* Confirmation */}
      <div className="bg-green-100 p-3 rounded-lg border border-green-400 text-center">
        <div className="text-green-800 font-bold">✅ Form Fields Ready</div>
        <div className="text-xs text-green-700 mt-1">
          {readingTemplate.length} templates | {readingMode} mode
        </div>
      </div>

      <div className="text-green-500 text-sm font-bold bg-green-100 p-2 border border-green-300">
        ✅ DEBUG: ReadingFormFields Finished
      </div>
    </div>
  );
};

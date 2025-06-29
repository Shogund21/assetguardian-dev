
import React, { useMemo } from "react";
import { Control } from "react-hook-form";
import { EmergencyFormFields } from "./fields/EmergencyFormFields";
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
  console.log('🎨 ReadingFormFields START:', {
    templateCount: readingTemplate.length,
    readingMode,
    extractedCount: extractedReadings.length,
    hasControl: !!control
  });

  const [hasRenderError, setHasRenderError] = React.useState(false);

  const groupedReadings = useMemo(() => {
    try {
      const grouped = readingTemplate.reduce((acc, reading) => {
        const section = reading.section || 'General';
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push(reading);
        return acc;
      }, {} as Record<string, ReadingTemplate[]>);

      return grouped;
    } catch (error) {
      console.error('❌ Error grouping readings:', error);
      setHasRenderError(true);
      return { 'Error': [] };
    }
  }, [readingTemplate]);

  if (hasRenderError || !control) {
    return <EmergencyFormFields control={control} />;
  }

  try {
    return (
      <div className="space-y-6 w-full bg-white p-4 rounded-lg border-2 border-gray-300">
        <div className="bg-purple-100 p-3 rounded-lg border border-purple-300">
          <div className="text-purple-800 font-bold">🔍 FORM FIELDS DEBUG</div>
          <div className="text-xs text-purple-700 space-y-1 mt-2">
            <div>✅ Templates loaded: {readingTemplate.length}</div>
            <div>✅ Reading mode: {readingMode}</div>
            <div>✅ Form control: {control ? 'READY' : '❌ MISSING'}</div>
            <div>✅ Sections: {Object.keys(groupedReadings).join(', ')}</div>
          </div>
        </div>

        <div className="space-y-3 w-full">
          {readingTemplate.length > 0 ? (
            <div className="text-sm text-green-700 p-4 bg-green-50 rounded-lg border-2 border-green-400">
              <div className="font-bold mb-2 flex items-center gap-2">
                ✅ SUCCESS: {readingTemplate.length} Reading Templates Loaded
              </div>
              <div className="text-green-600 space-y-1">
                {Object.keys(groupedReadings).length > 1 && (
                  <div>📂 Sections: {Object.keys(groupedReadings).join(', ')}</div>
                )}
                <div className="text-xs bg-green-200 p-2 rounded">
                  🎯 Ready for {readingMode} entry mode
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-red-700 p-4 bg-red-50 rounded-lg border-2 border-red-400">
              <div className="font-bold mb-2">⚠️ No Reading Templates Found</div>
              <div className="text-red-600 text-xs">Equipment mode: {readingMode}</div>
            </div>
          )}
        </div>

        <ReadingTypeField
          control={control}
          readingTemplate={readingTemplate}
          readingMode={readingMode}
          extractedReadings={extractedReadings}
          groupedReadings={groupedReadings}
        />

        <ValueField control={control} />

        <UnitField 
          control={control}
          templateReading={templateReading}
          readingMode={readingMode}
        />

        <NotesFields control={control} />

        <div className="bg-green-100 p-3 rounded-lg border border-green-400 text-center">
          <div className="text-green-800 font-bold">✅ FORM FIELDS RENDERED SUCCESSFULLY</div>
          <div className="text-xs text-green-700 mt-1">
            All {readingTemplate.length} templates loaded | Mode: {readingMode} | Ready for input
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ CRITICAL ERROR in ReadingFormFields render:', error);
    setHasRenderError(true);
    return <EmergencyFormFields control={control} />;
  }
};

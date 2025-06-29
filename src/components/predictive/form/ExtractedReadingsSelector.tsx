
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";

interface ExtractedReading {
  type: string;
  value: string;
  unit: string;
  confidence: number;
  location?: string;
}

interface ExtractedReadingsSelectorProps {
  extractedReadings: ExtractedReading[];
  selectedReading: ExtractedReading | null;
  onReadingSelection: (reading: ExtractedReading) => void;
}

export const ExtractedReadingsSelector = ({
  extractedReadings,
  selectedReading,
  onReadingSelection
}: ExtractedReadingsSelectorProps) => {
  console.log('📋 ExtractedReadingsSelector render:', {
    readingCount: extractedReadings.length,
    hasSelected: !!selectedReading
  });

  if (extractedReadings.length <= 1) {
    console.log('📋 Not showing selector - only', extractedReadings.length, 'readings');
    return null;
  }

  return (
    <div className="space-y-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
      <div className="text-yellow-800 font-bold mb-2">📋 AI EXTRACTED READINGS SELECTOR</div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Select Reading to Use ({extractedReadings.length} found)
        </label>
        <div className="grid gap-2">
          {extractedReadings.map((reading, index) => (
            <div
              key={index}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 touch-manipulation min-h-[60px] ${
                selectedReading === reading 
                  ? 'border-blue-500 bg-blue-100 shadow-lg ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onClick={() => {
                console.log('📋 Reading selected:', reading.type);
                onReadingSelection(reading);
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <span className="font-medium text-base">{reading.type}</span>
                  {reading.location && (
                    <div className="text-xs text-gray-500 mt-1">📍 {reading.location}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{reading.value} {reading.unit}</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(reading.confidence * 100)}% confident
                  </div>
                </div>
                {selectedReading === reading && (
                  <div className="ml-3 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg flex-shrink-0"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded border">
        💡 Tip: Select the most accurate reading based on confidence level and location
      </div>
    </div>
  );
};

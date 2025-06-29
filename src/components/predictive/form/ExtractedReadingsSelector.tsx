
import React from "react";

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
  if (extractedReadings.length <= 1) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Select Reading to Use</label>
      <div className="grid gap-2">
        {extractedReadings.map((reading, index) => (
          <div
            key={index}
            className={`p-3 border rounded cursor-pointer transition-colors touch-manipulation min-h-[44px] ${
              selectedReading === reading ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onReadingSelection(reading)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{reading.type}</span>
              <div className="text-right">
                <span className="text-lg">{reading.value} {reading.unit}</span>
                <div className="text-xs text-gray-500">
                  {Math.round(reading.confidence * 100)}% confident
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

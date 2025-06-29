
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera, Edit3 } from "lucide-react";

interface ReadingModeSelectorProps {
  readingMode: "manual" | "ai_image";
  onReadingModeChange: (mode: "manual" | "ai_image") => void;
}

export const ReadingModeSelector = ({ 
  readingMode, 
  onReadingModeChange 
}: ReadingModeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-base font-medium">Choose Recording Method</label>
        <div className="text-xs text-gray-500 hidden md:block">
          Select how you want to record readings
        </div>
      </div>
      <RadioGroup
        value={readingMode}
        onValueChange={(value: "manual" | "ai_image") => onReadingModeChange(value)}
        className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
      >
        {/* Manual Entry Option */}
        <div className="relative">
          <RadioGroupItem 
            value="manual" 
            id="manual" 
            className="sr-only peer" 
          />
          <label 
            htmlFor="manual" 
            className="flex items-center gap-3 p-4 min-h-[60px] md:min-h-[80px] border-2 rounded-lg cursor-pointer transition-all duration-200 peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:shadow-md hover:bg-gray-50 hover:border-gray-300 touch-manipulation"
          >
            <div className="flex-shrink-0 p-2 rounded-full bg-purple-100 peer-checked:bg-purple-200">
              <Edit3 className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-base md:text-lg">Manual Entry</div>
              <div className="text-sm text-gray-600 mt-1">Type readings manually with keyboard</div>
            </div>
            {readingMode === "manual" && (
              <div className="flex-shrink-0 w-3 h-3 bg-purple-500 rounded-full"></div>
            )}
          </label>
        </div>
        
        {/* AI Camera Option */}
        <div className="relative">
          <RadioGroupItem 
            value="ai_image" 
            id="ai_image" 
            className="sr-only peer" 
          />
          <label 
            htmlFor="ai_image" 
            className="flex items-center gap-3 p-4 min-h-[60px] md:min-h-[80px] border-2 rounded-lg cursor-pointer transition-all duration-200 peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:shadow-md hover:bg-gray-50 hover:border-gray-300 touch-manipulation"
          >
            <div className="flex-shrink-0 p-2 rounded-full bg-green-100 peer-checked:bg-green-200">
              <Camera className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-base md:text-lg">AI Camera</div>
              <div className="text-sm text-gray-600 mt-1">Extract readings from photos automatically</div>
            </div>
            {readingMode === "ai_image" && (
              <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full"></div>
            )}
          </label>
        </div>
      </RadioGroup>
      
      {/* Mobile-specific hint */}
      <div className="md:hidden">
        <div className="text-xs text-gray-500 text-center py-2 px-3 bg-blue-50 rounded-md border border-blue-200">
          💡 {readingMode === "manual" ? "Use the keyboard to type in values" : "Take a photo of gauges, meters, or displays"}
        </div>
      </div>
    </div>
  );
};

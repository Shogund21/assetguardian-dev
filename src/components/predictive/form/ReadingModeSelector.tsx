
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
  console.log('🎛️ ReadingModeSelector rendering:', { readingMode });

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm w-full">
      <div className="flex items-center justify-between">
        <label className="text-base font-bold text-gray-900">Choose Recording Method</label>
        <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
          Mobile Optimized
        </div>
      </div>
      
      <RadioGroup
        value={readingMode}
        onValueChange={(value: "manual" | "ai_image") => {
          console.log('📻 Mode change:', value);
          onReadingModeChange(value);
        }}
        className="grid grid-cols-1 gap-4 w-full"
      >
        {/* Manual Entry Option */}
        <div className="relative w-full">
          <RadioGroupItem 
            value="manual" 
            id="manual" 
            className="sr-only peer" 
          />
          <label 
            htmlFor="manual" 
            className={`flex items-center gap-4 p-6 min-h-[80px] border-3 rounded-xl cursor-pointer transition-all duration-300 touch-manipulation w-full ${
              readingMode === "manual" 
                ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-300' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className={`flex-shrink-0 p-3 rounded-full transition-colors ${
              readingMode === "manual" ? 'bg-purple-200' : 'bg-purple-100'
            }`}>
              <Edit3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-lg mb-1">Manual Entry</div>
              <div className="text-sm text-gray-600">Type readings manually with keyboard</div>
              <div className="text-xs text-purple-600 mt-2 font-medium">✓ Works offline</div>
            </div>
            {readingMode === "manual" && (
              <div className="flex-shrink-0 w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-sm"></div>
            )}
          </label>
        </div>
        
        {/* AI Camera Option */}
        <div className="relative w-full">
          <RadioGroupItem 
            value="ai_image" 
            id="ai_image" 
            className="sr-only peer" 
          />
          <label 
            htmlFor="ai_image" 
            className={`flex items-center gap-4 p-6 min-h-[80px] border-3 rounded-xl cursor-pointer transition-all duration-300 touch-manipulation w-full ${
              readingMode === "ai_image" 
                ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-300' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className={`flex-shrink-0 p-3 rounded-full transition-colors ${
              readingMode === "ai_image" ? 'bg-green-200' : 'bg-green-100'
            }`}>
              <Camera className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-lg mb-1">AI Camera</div>
              <div className="text-sm text-gray-600">Extract readings from photos automatically</div>
              <div className="text-xs text-green-600 mt-2 font-medium">✓ Fast & accurate</div>
            </div>
            {readingMode === "ai_image" && (
              <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            )}
          </label>
        </div>
      </RadioGroup>
      
      {/* Enhanced Mobile-specific status */}
      <div className="mt-4">
        <div className={`text-sm text-center py-3 px-4 rounded-lg border-2 transition-all ${
          readingMode === "manual" 
            ? "bg-purple-50 border-purple-300 text-purple-700" 
            : "bg-green-50 border-green-300 text-green-700"
        }`}>
          <div className="font-bold mb-1">
            {readingMode === "manual" ? "📝 Manual Mode Selected" : "📷 AI Camera Mode Selected"}
          </div>
          <div className="text-xs">
            {readingMode === "manual" 
              ? "Enter values using your device keyboard" 
              : "Take photos of meters, gauges, or displays for automatic reading extraction"
            }
          </div>
        </div>
      </div>
    </div>
  );
};

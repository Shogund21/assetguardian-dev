
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
    <div className="w-full bg-white p-4 rounded-lg border-2 border-blue-300 shadow-sm">
      <div className="bg-blue-100 p-3 rounded-lg mb-4">
        <div className="text-blue-800 font-bold">🎯 MODE SELECTOR DEBUG</div>
        <div className="text-xs text-blue-700">Current mode: {readingMode}</div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <label className="text-base font-bold text-gray-900">Choose Recording Method</label>
        <div className="text-xs text-blue-600 bg-blue-200 px-3 py-1 rounded-full font-medium">
          Mobile Ready
        </div>
      </div>
      
      <RadioGroup
        value={readingMode}
        onValueChange={(value: "manual" | "ai_image") => {
          console.log('📻 Mode changing to:', value);
          onReadingModeChange(value);
        }}
        className="grid grid-cols-1 gap-4 w-full"
      >
        {/* Manual Entry Option - Enhanced visibility */}
        <div className="relative w-full">
          <RadioGroupItem 
            value="manual" 
            id="manual" 
            className="sr-only peer" 
          />
          <label 
            htmlFor="manual" 
            className={`flex items-center gap-4 p-6 min-h-[90px] border-4 rounded-xl cursor-pointer transition-all duration-200 touch-manipulation w-full ${
              readingMode === "manual" 
                ? 'border-purple-500 bg-purple-100 shadow-lg ring-4 ring-purple-200' 
                : 'border-gray-400 hover:border-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className={`flex-shrink-0 p-4 rounded-full transition-colors ${
              readingMode === "manual" ? 'bg-purple-300' : 'bg-purple-200'
            }`}>
              <Edit3 className="h-7 w-7 text-purple-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-xl mb-2">Manual Entry</div>
              <div className="text-sm text-gray-600 mb-2">Type readings with keyboard</div>
              <div className="text-xs text-purple-600 font-medium">✓ Works offline</div>
            </div>
            {readingMode === "manual" && (
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
            )}
          </label>
        </div>
        
        {/* AI Camera Option - Enhanced visibility */}
        <div className="relative w-full">
          <RadioGroupItem 
            value="ai_image" 
            id="ai_image" 
            className="sr-only peer" 
          />
          <label 
            htmlFor="ai_image" 
            className={`flex items-center gap-4 p-6 min-h-[90px] border-4 rounded-xl cursor-pointer transition-all duration-200 touch-manipulation w-full ${
              readingMode === "ai_image" 
                ? 'border-green-500 bg-green-100 shadow-lg ring-4 ring-green-200' 
                : 'border-gray-400 hover:border-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className={`flex-shrink-0 p-4 rounded-full transition-colors ${
              readingMode === "ai_image" ? 'bg-green-300' : 'bg-green-200'
            }`}>
              <Camera className="h-7 w-7 text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-xl mb-2">AI Camera</div>
              <div className="text-sm text-gray-600 mb-2">Extract readings from photos</div>
              <div className="text-xs text-green-600 font-medium">✓ Fast & accurate</div>
            </div>
            {readingMode === "ai_image" && (
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
            )}
          </label>
        </div>
      </RadioGroup>
      
      {/* Enhanced status indicator */}
      <div className="mt-4">
        <div className={`text-sm text-center py-4 px-4 rounded-lg border-4 transition-all ${
          readingMode === "manual" 
            ? "bg-purple-100 border-purple-400 text-purple-800" 
            : "bg-green-100 border-green-400 text-green-800"
        }`}>
          <div className="font-bold text-lg mb-2">
            {readingMode === "manual" ? "📝 Manual Mode Active" : "📷 AI Camera Mode Active"}
          </div>
          <div className="text-sm">
            {readingMode === "manual" 
              ? "Use your device keyboard to enter values" 
              : "Take photos of meters and gauges for automatic extraction"
            }
          </div>
        </div>
      </div>
    </div>
  );
};


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
  console.log('🎛️ ReadingModeSelector render - ENHANCED:', { 
    readingMode,
    timestamp: Date.now()
  });

  // Error boundary state
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    console.error('🚨 ReadingModeSelector error state');
    return (
      <div className="w-full bg-red-50 p-4 rounded-lg border-2 border-red-300">
        <div className="text-red-800 font-bold text-center">⚠️ MODE SELECTOR ERROR</div>
        <div className="text-red-700 text-sm text-center mt-2">
          Please refresh the page to restore functionality.
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="w-full bg-white p-4 rounded-lg border-2 border-blue-300 shadow-sm">
        <div className="bg-blue-100 p-3 rounded-lg mb-4">
          <div className="text-blue-800 font-bold">🎯 MODE SELECTOR DEBUG - ENHANCED</div>
          <div className="text-xs text-blue-700 space-y-1 mt-1">
            <div>Current mode: <strong>{readingMode}</strong></div>
            <div>Render time: {new Date().toLocaleTimeString()}</div>
            <div>Component state: ✅ ACTIVE</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <label className="text-base font-bold text-gray-900">Choose Recording Method</label>
          <div className="text-xs text-blue-600 bg-blue-200 px-3 py-1 rounded-full font-medium">
            📱 Mobile Ready
          </div>
        </div>
        
        <RadioGroup
          value={readingMode}
          onValueChange={(value: "manual" | "ai_image") => {
            try {
              console.log('📻 Mode changing from', readingMode, 'to:', value);
              onReadingModeChange(value);
            } catch (error) {
              console.error('❌ Error changing mode:', error);
              setHasError(true);
            }
          }}
          className="grid grid-cols-1 gap-4 w-full"
        >
          {/* Manual Entry Option - Enhanced */}
          <div className="relative w-full">
            <RadioGroupItem 
              value="manual" 
              id="manual" 
              className="sr-only peer" 
            />
            <label 
              htmlFor="manual" 
              className={`flex items-center gap-4 p-6 min-h-[90px] border-4 rounded-xl cursor-pointer transition-all duration-200 touch-manipulation w-full hover:shadow-lg ${
                readingMode === "manual" 
                  ? 'border-purple-500 bg-purple-100 shadow-lg ring-4 ring-purple-200 transform scale-[1.02]' 
                  : 'border-gray-400 hover:border-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className={`flex-shrink-0 p-4 rounded-full transition-all duration-200 ${
                readingMode === "manual" ? 'bg-purple-300 shadow-lg' : 'bg-purple-200'
              }`}>
                <Edit3 className="h-7 w-7 text-purple-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-xl mb-2">📝 Manual Entry</div>
                <div className="text-sm text-gray-600 mb-2">Type readings with keyboard</div>
                <div className="text-xs text-purple-600 font-medium">✓ Works offline</div>
              </div>
              {readingMode === "manual" && (
                <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
              )}
            </label>
          </div>
          
          {/* AI Camera Option - Enhanced */}
          <div className="relative w-full">
            <RadioGroupItem 
              value="ai_image" 
              id="ai_image" 
              className="sr-only peer" 
            />
            <label 
              htmlFor="ai_image" 
              className={`flex items-center gap-4 p-6 min-h-[90px] border-4 rounded-xl cursor-pointer transition-all duration-200 touch-manipulation w-full hover:shadow-lg ${
                readingMode === "ai_image" 
                  ? 'border-green-500 bg-green-100 shadow-lg ring-4 ring-green-200 transform scale-[1.02]' 
                  : 'border-gray-400 hover:border-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className={`flex-shrink-0 p-4 rounded-full transition-all duration-200 ${
                readingMode === "ai_image" ? 'bg-green-300 shadow-lg' : 'bg-green-200'
              }`}>
                <Camera className="h-7 w-7 text-green-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-xl mb-2">📷 AI Camera</div>
                <div className="text-sm text-gray-600 mb-2">Extract readings from photos</div>
                <div className="text-xs text-green-600 font-medium">✓ Fast & accurate</div>
              </div>
              {readingMode === "ai_image" && (
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
              )}
            </label>
          </div>
        </RadioGroup>
        
        {/* Enhanced status indicator with animation */}
        <div className="mt-4">
          <div className={`text-sm text-center py-4 px-4 rounded-lg border-4 transition-all duration-300 ${
            readingMode === "manual" 
              ? "bg-purple-100 border-purple-400 text-purple-800 shadow-lg" 
              : "bg-green-100 border-green-400 text-green-800 shadow-lg"
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
        
        {/* Success confirmation */}
        <div className="mt-4 bg-green-100 p-2 rounded-lg border border-green-300 text-center">
          <div className="text-green-800 font-bold text-sm">✅ MODE SELECTOR READY</div>
          <div className="text-xs text-green-700">Current: {readingMode} | Touch interactions enabled</div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Error in ReadingModeSelector render:', error);
    setHasError(true);
    return null;
  }
};

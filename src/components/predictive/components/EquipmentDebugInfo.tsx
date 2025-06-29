
import React from "react";

interface EquipmentDebugInfoProps {
  detectedEquipmentType: string;
  templateCount: number;
  readingMode: string;
  form: any;
}

export const EquipmentDebugInfo = ({
  detectedEquipmentType,
  templateCount,
  readingMode,
  form
}: EquipmentDebugInfoProps) => {
  return (
    <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded-lg border-2 border-blue-300">
      <div className="text-blue-800 font-bold mb-2">🔧 COMPONENT STATUS</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span>Equipment:</span>
          <span className="font-bold text-blue-700">{detectedEquipmentType}</span>
        </div>
        <div className="flex justify-between">
          <span>Templates:</span>
          <span className={`font-bold ${templateCount > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {templateCount}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Mode:</span>
          <span className="font-bold text-purple-700">{readingMode}</span>
        </div>
        <div className="flex justify-between">
          <span>Form:</span>
          <span className="font-bold text-green-700">{form ? '✅' : '❌'}</span>
        </div>
      </div>
      {detectedEquipmentType === 'chiller' && templateCount > 0 && (
        <div className="text-green-700 text-center font-bold bg-green-200 p-2 rounded border mt-2">
          ✅ Chiller template active ({templateCount} readings available)
        </div>
      )}
    </div>
  );
};

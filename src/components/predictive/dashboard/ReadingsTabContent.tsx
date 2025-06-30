
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ManualReadingEntry from "../ManualReadingEntry";
import { EquipmentSelector } from "./EquipmentSelector";

interface Equipment {
  id: string;
  name: string;
  location: string;
  status?: string;
}

interface ReadingTemplate {
  type: string;
  label: string;
  unit: string;
}

interface ReadingsTabContentProps {
  equipment: Equipment[];
  selectedEquipmentId: string;
  onEquipmentChange: (equipmentId: string) => void;
  selectedEquipment: Equipment | undefined;
  equipmentType: string;
  readingTemplates: ReadingTemplate[];
  isOnline: boolean;
}

export const ReadingsTabContent = ({
  equipment,
  selectedEquipmentId,
  onEquipmentChange,
  selectedEquipment,
  equipmentType,
  readingTemplates,
  isOnline
}: ReadingsTabContentProps) => {
  const getEquipmentTypeFromName = (equipment: Equipment | undefined): string => {
    if (!equipment) return 'general';
    const name = equipment.name.toLowerCase();
    if (name.includes('chiller') || name.includes('chill')) return 'chiller';
    if (name.includes('ahu') || name.includes('air handler') || name.includes('air handling')) return 'ahu';
    if (name.includes('rtu') || name.includes('rooftop') || name.includes('roof top')) return 'rtu';
    if (name.includes('cooling tower') || name.includes('tower')) return 'cooling_tower';
    return 'general';
  };

  const finalEquipmentType = equipmentType || getEquipmentTypeFromName(selectedEquipment);

  return (
    <div className="space-y-4 mt-4 min-h-screen overflow-y-auto px-2 md:px-0 border-l-4 border-blue-200">
      {/* Header Section */}
      <div className="pt-2 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Equipment Readings</h3>
        <p className="text-sm text-gray-600">Select equipment below to start recording readings</p>
      </div>

      {/* Equipment Selector */}
      <div className="mb-4 border-2 border-purple-200 p-2 rounded-md">
        <EquipmentSelector
          equipment={equipment}
          selectedEquipmentId={selectedEquipmentId}
          onEquipmentChange={onEquipmentChange}
          placeholder="Select equipment to monitor"
          className="w-full"
        />
      </div>

      {/* Conditional Rendering */}
      {selectedEquipment ? (
        <div className="space-y-4 border-2 border-green-300 p-2 rounded-md">
          {/* Equipment Info Card */}
          <Card className="mobile-card border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{selectedEquipment.name}</CardTitle>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{selectedEquipment.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-green-600">{selectedEquipment.status || 'Active'}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium text-blue-600">{finalEquipmentType}</span>
                </div>
                {readingTemplates.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-blue-800 font-medium text-sm text-center">
                    ✅ {readingTemplates.length} readings available
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          <ManualReadingEntry 
            equipmentId={selectedEquipmentId}
            equipmentType={finalEquipmentType}
            onSuccess={() => {
              console.log('✅ Reading recorded successfully for:', selectedEquipment.name);
            }}
          />
        </div>
      ) : (
        <Card className="mobile-card">
          <CardContent className="py-12 text-center">
            <div className="space-y-3">
              <div className="text-4xl">🔧</div>
              <h3 className="text-lg font-medium">Select Equipment</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choose equipment above to start recording readings
              </p>
              {!isOnline && equipment.length === 0 && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-orange-700 font-medium">
                    📡 No cached equipment available. Connect to internet to load equipment list.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

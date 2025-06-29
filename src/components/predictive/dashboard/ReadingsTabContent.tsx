
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
  // Enhanced equipment type detection with detailed logging
  const getEquipmentTypeFromName = (equipment: Equipment | undefined): string => {
    if (!equipment) {
      console.log('🔍 No equipment selected, defaulting to general');
      return 'general';
    }
    
    const name = equipment.name.toLowerCase();
    console.log('🔍 Detecting equipment type for:', {
      originalName: equipment.name,
      lowerName: name,
      id: equipment.id
    });
    
    if (name.includes('chiller') || name.includes('chill')) {
      console.log('🧊 Detected as CHILLER type');
      return 'chiller';
    }
    if (name.includes('ahu') || name.includes('air handler') || name.includes('air handling')) {
      console.log('🌬️ Detected as AHU type');
      return 'ahu';
    }
    if (name.includes('rtu') || name.includes('rooftop') || name.includes('roof top')) {
      console.log('🏠 Detected as RTU type');
      return 'rtu';
    }
    if (name.includes('cooling tower') || name.includes('tower')) {
      console.log('🗼 Detected as cooling tower type');
      return 'cooling_tower';
    }
    
    console.log('📋 Defaulted to general type');
    return 'general';
  };

  // Use the passed equipmentType prop first, then fallback to detection
  const finalEquipmentType = equipmentType || getEquipmentTypeFromName(selectedEquipment);
  
  console.log('🎯 Final equipment type resolution:', {
    passedEquipmentType: equipmentType,
    detectedFromName: getEquipmentTypeFromName(selectedEquipment),
    finalType: finalEquipmentType,
    selectedEquipmentName: selectedEquipment?.name
  });

  return (
    <div className="space-y-4">
      <EquipmentSelector
        equipment={equipment}
        selectedEquipmentId={selectedEquipmentId}
        onEquipmentChange={onEquipmentChange}
        placeholder="Select equipment to monitor"
        className="mb-6"
      />

      {selectedEquipment ? (
        <div className="space-y-6">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-lg">{selectedEquipment.name}</CardTitle>
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{selectedEquipment.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-green-600">{selectedEquipment.status || 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Detected Type:</span>
                    <span className="font-medium text-blue-600">{finalEquipmentType}</span>
                  </div>
                </div>
                
                {readingTemplates.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-blue-800 font-medium text-center">
                      ✅ {readingTemplates.length} standard readings available for this equipment type
                    </div>
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

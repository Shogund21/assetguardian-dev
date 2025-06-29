
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
  // Enhanced equipment type detection
  const getEquipmentTypeFromName = (equipment: Equipment | undefined): string => {
    if (!equipment) return 'general';
    
    const name = equipment.name.toLowerCase();
    console.log('Detecting equipment type for equipment:', equipment.name);
    
    if (name.includes('chiller') || name.includes('chill')) {
      console.log('Detected as chiller');
      return 'chiller';
    }
    if (name.includes('ahu') || name.includes('air handler') || name.includes('air handling')) {
      return 'ahu';
    }
    if (name.includes('rtu') || name.includes('rooftop') || name.includes('roof top')) {
      return 'rtu';
    }
    if (name.includes('cooling tower') || name.includes('tower')) {
      return 'cooling_tower';
    }
    
    return 'general';
  };

  const detectedEquipmentType = getEquipmentTypeFromName(selectedEquipment);

  return (
    <>
      <EquipmentSelector
        equipment={equipment}
        selectedEquipmentId={selectedEquipmentId}
        onEquipmentChange={onEquipmentChange}
        placeholder="Select equipment to monitor"
      />

      {selectedEquipment ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedEquipment.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                <p>Location: {selectedEquipment.location}</p>
                <p>Status: {selectedEquipment.status || 'Active'}</p>
                <p>Detected Type: {detectedEquipmentType}</p>
                {readingTemplates.length > 0 && (
                  <p className="mt-2 text-blue-600">
                    {readingTemplates.length} standard readings available for this equipment type
                  </p>
                )}
              </div>
            </CardHeader>
          </Card>

          <ManualReadingEntry 
            equipmentId={selectedEquipmentId}
            equipmentType={detectedEquipmentType}
            onSuccess={() => {
              console.log('Reading recorded successfully');
            }}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium mb-2">Select Equipment</h3>
            <p className="text-muted-foreground">
              Choose equipment above to start recording readings
              {!isOnline && equipment.length === 0 && (
                <span className="block mt-2 text-orange-600">
                  No cached equipment available. Connect to internet to load equipment list.
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

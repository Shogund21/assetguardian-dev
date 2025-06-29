
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
            equipmentType={equipmentType}
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

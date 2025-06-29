
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EquipmentSelector } from "./EquipmentSelector";

interface Equipment {
  id: string;
  name: string;
  location: string;
  status?: string;
}

interface EquipmentTabContentProps {
  equipment: Equipment[];
  selectedEquipmentId: string;
  onEquipmentChange: (equipmentId: string) => void;
  selectedEquipment: Equipment | undefined;
  placeholder: string;
  emptyStateTitle: string;
  emptyStateMessage: string;
  children: React.ReactNode;
}

export const EquipmentTabContent = ({
  equipment,
  selectedEquipmentId,
  onEquipmentChange,
  selectedEquipment,
  placeholder,
  emptyStateTitle,
  emptyStateMessage,
  children
}: EquipmentTabContentProps) => {
  return (
    <>
      <EquipmentSelector
        equipment={equipment}
        selectedEquipmentId={selectedEquipmentId}
        onEquipmentChange={onEquipmentChange}
        placeholder={placeholder}
      />

      {selectedEquipment ? (
        children
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium mb-2">{emptyStateTitle}</h3>
            <p className="text-muted-foreground">{emptyStateMessage}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
};


import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Equipment {
  id: string;
  name: string;
  location: string;
  status?: string;
}

interface EquipmentSelectorProps {
  equipment: Equipment[];
  selectedEquipmentId: string;
  onEquipmentChange: (equipmentId: string) => void;
  placeholder?: string;
  className?: string;
}

export const EquipmentSelector = ({ 
  equipment, 
  selectedEquipmentId, 
  onEquipmentChange, 
  placeholder = "Select equipment",
  className = "w-full"
}: EquipmentSelectorProps) => {
  return (
    <div className={`mb-6 ${className}`}>
      <Select value={selectedEquipmentId} onValueChange={onEquipmentChange}>
        <SelectTrigger className="w-full touch-manipulation" style={{ minHeight: '44px' }}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {equipment.map((eq) => (
            <SelectItem key={eq.id} value={eq.id} className="touch-manipulation">
              {eq.name} - {eq.location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

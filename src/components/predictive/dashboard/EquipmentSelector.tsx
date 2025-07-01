
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { groupAndSortEquipment } from "@/utils/equipmentSorting";

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
  const groupedEquipment = groupAndSortEquipment(equipment);
  
  return (
    <div className={className}>
      <Select value={selectedEquipmentId} onValueChange={onEquipmentChange}>
        <SelectTrigger className="w-full touch-manipulation h-10" style={{ minHeight: '40px' }}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {groupedEquipment.map((group) => (
            <React.Fragment key={group.type}>
              {groupedEquipment.length > 1 && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                  {group.typeLabel}
                </div>
              )}
              {group.equipment.map((eq) => (
                <SelectItem key={eq.id} value={eq.id} className="touch-manipulation">
                  <div className="flex flex-col">
                    <span className="font-medium">{eq.name}</span>
                    <span className="text-xs text-muted-foreground">{eq.location}</span>
                  </div>
                </SelectItem>
              ))}
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

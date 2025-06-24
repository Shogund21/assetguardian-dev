
import { Equipment } from "@/types/equipment";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Pen, QrCode } from "lucide-react";
import { StatusDropdown } from "./StatusDropdown";
import { DeleteEquipmentDialog } from "./DeleteEquipmentDialog";
import { QRCodeDialog } from "./QRCodeDialog";
import { EditEquipmentDialog } from "./EditEquipmentDialog";
import { useNavigate } from "react-router-dom";

interface EquipmentCardProps {
  equipment: Equipment;
  onStatusChange: (equipmentId: string, newStatus: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EquipmentCard = ({ equipment, onStatusChange, onDelete }: EquipmentCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-4 md:p-6 h-full">
      <div className="flex flex-col h-full">
        {/* Equipment header section */}
        <div 
          className="cursor-pointer mb-3" 
          onClick={() => navigate(`/equipment/${equipment.id}`)}
        >
          <h3 className="text-base md:text-lg font-semibold break-words">{equipment.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{equipment.location}</p>
        </div>
        
        {/* Status dropdown */}
        <div className="mb-4">
          <StatusDropdown 
            status={equipment.status} 
            onStatusChange={(newStatus) => onStatusChange(equipment.id, newStatus)}
          />
        </div>
        
        {/* Equipment details */}
        <div 
          className="space-y-2 text-sm flex-grow mb-4 cursor-pointer" 
          onClick={() => navigate(`/equipment/${equipment.id}`)}
        >
          <p><span className="font-medium">Model:</span> {equipment.model || "N/A"}</p>
          <p><span className="font-medium">Serial Number:</span> {equipment.serial_number || "N/A"}</p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 flex items-center justify-center text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/equipment/${equipment.id}`);
            }}
          >
            <QrCode className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">View</span>
          </Button>
          
          <EditEquipmentDialog equipment={equipment}>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 flex items-center justify-center text-green-500 hover:text-green-600 hover:bg-green-50"
            >
              <Pen className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Edit</span>
            </Button>
          </EditEquipmentDialog>
          
          <DeleteEquipmentDialog onDelete={() => onDelete(equipment.id)}>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Delete</span>
            </Button>
          </DeleteEquipmentDialog>
        </div>
      </div>
    </Card>
  );
};


import { format } from "date-fns";
import { MaintenanceCheck } from "@/types/maintenance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface MaintenanceCheckItemProps {
  check: MaintenanceCheck;
  onEdit: (check: MaintenanceCheck) => void;
  onDelete: (check: MaintenanceCheck) => void;
  showDeleteButton?: boolean;
}

const MaintenanceCheckItem = ({ check, onEdit, onDelete, showDeleteButton = false }: MaintenanceCheckItemProps) => {
  const getStatusBadge = (status: string | null) => {
    const statusColors = {
      completed: "bg-green-500",
      pending: "bg-yellow-500",
      issue_found: "bg-red-500"
    };
    
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || "bg-gray-500"}`}>
        {status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
      </Badge>
    );
  };

  return (
    <div 
      key={check.id} 
      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">
              {check.equipment?.name}
            </h3>
            {getStatusBadge(check.status)}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Location: {check.equipment?.location}</p>
            <p>Date: {format(new Date(check.check_date || ''), "PPP")}</p>
            <p>
              Technician: {check.technician ? 
                `${check.technician.firstName} ${check.technician.lastName}` : 
                'Unassigned'
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(check)}
            className="hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>
          {showDeleteButton && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(check)}
              className="hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCheckItem;

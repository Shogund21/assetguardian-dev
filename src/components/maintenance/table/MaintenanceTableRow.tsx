
import { format } from "date-fns";
import { MaintenanceCheck } from "@/types/maintenance";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import MaintenanceCheckDetails from "../MaintenanceCheckDetails";
import { useIsMobile } from "@/hooks/use-mobile";

interface MaintenanceTableRowProps {
  check: MaintenanceCheck;
  onStatusChange: (id: string, status: "completed" | "pending" | "issue_found") => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const MaintenanceTableRow = ({
  check,
  onStatusChange,
  onDelete,
}: MaintenanceTableRowProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "issue_found":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getEquipmentTypeDisplay = (type: string | null) => {
    if (!type) return "";
    
    const typeMap: Record<string, string> = {
      ahu: "AHU",
      chiller: "Chiller",
      cooling_tower: "Cooling Tower",
      elevator: "Elevator",
      restroom: "Restroom",
      general: "General"
    };
    
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTechnicianName = () => {
    if (!check.technician) return "Unassigned";
    return `${check.technician.firstName} ${check.technician.lastName}`;
  };

  // Updated getLocationName function to properly prioritize the selected location
  const getLocationName = () => {
    // First priority: Use the location object from the selected location_id
    if (check.location && typeof check.location === 'object' && 'name' in check.location) {
      console.log('Using selected location from locations table:', check.location);
      
      // Display location name with store number if available
      return check.location.store_number 
        ? `${check.location.name} (${check.location.store_number})`
        : check.location.name;
    }
    
    // Second priority: Fallback to equipment location if no location was specifically selected
    if (check.equipment?.location) {
      console.log('Falling back to equipment.location:', check.equipment.location);
      return check.equipment.location;
    }
    
    return "Location Not Available";
  };

  return (
    <>
      <div className="border rounded-lg p-4 space-y-4 bg-white shadow-sm hover:shadow transition-shadow duration-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">
                {check.equipment?.name || "Equipment Not Available"}
              </h3>
              {check.equipment_type && (
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                  {getEquipmentTypeDisplay(check.equipment_type)}
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Date: {format(new Date(check.check_date || ""), "PPP")}</p>
              <p>Location: {getLocationName()}</p>
              <p>Technician: {getTechnicianName()}</p>
            </div>
          </div>
          <div className={`flex ${isMobile ? 'w-full flex-col' : 'items-center'} gap-2`}>
            <Badge className={`${getStatusColor(check.status || "")} ${isMobile ? 'self-start' : ''}`}>
              {check.status?.replace("_", " ").toUpperCase()}
            </Badge>
            <Select
              defaultValue={check.status || ""}
              onValueChange={(value: "completed" | "pending" | "issue_found") =>
                onStatusChange(check.id, value)
              }
            >
              <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[180px]'} bg-white border-gray-200`}>
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="completed" className="cursor-pointer hover:bg-gray-100">
                  Completed
                </SelectItem>
                <SelectItem value="pending" className="cursor-pointer hover:bg-gray-100">
                  Pending
                </SelectItem>
                <SelectItem value="issue_found" className="cursor-pointer hover:bg-gray-100">
                  Issue Found
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size={isMobile ? "default" : "icon"}
              onClick={() => setShowDetails(true)}
              className={`hover:bg-blue-50 ${isMobile ? 'w-full' : ''}`}
            >
              <Eye className="h-4 w-4 text-blue-600 mr-2" />
              {isMobile && "View Details"}
            </Button>
          </div>
        </div>
      </div>

      <MaintenanceCheckDetails 
        check={check}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
};

export default MaintenanceTableRow;

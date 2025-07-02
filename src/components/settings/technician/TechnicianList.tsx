
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserX, Shield, User } from "lucide-react";
import EditTechnicianDialog from "./EditTechnicianDialog";
import EditRoleDialog from "./EditRoleDialog";

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  userRole?: string;
  isAdmin?: boolean;
}

interface TechnicianListProps {
  technicians: Technician[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Omit<Technician, 'id'>) => void;
  onRoleUpdate: (id: string, role: string, isAdmin: boolean) => void;
}

const TechnicianList = ({ technicians, onDelete, onUpdate, onRoleUpdate }: TechnicianListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Current Technicians</h3>
      <div className="divide-y divide-gray-200">
        {technicians?.map((technician) => (
          <div
            key={technician.id}
            className="flex items-center justify-between py-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">
                  {technician.firstName} {technician.lastName}
                </p>
                <Badge variant={technician.userRole === 'admin' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {technician.userRole === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  {technician.userRole === 'admin' ? 'Admin' : 'Technician'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {technician.specialization}
              </p>
              <p className="text-sm text-muted-foreground">
                {technician.email} • {technician.phone}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <EditTechnicianDialog 
                technician={technician}
                onUpdate={onUpdate}
              />
              <EditRoleDialog
                technician={technician}
                onRoleUpdate={onRoleUpdate}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(technician.id)}
              >
                <UserX className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicianList;

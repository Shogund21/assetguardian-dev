
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, User, UserCheck, UserX } from "lucide-react";
import { Technician } from "@/types/technician";
import EditTechnicianDialog from "./EditTechnicianDialog";
import EditRoleDialog from "./EditRoleDialog";

interface TechnicianListProps {
  technicians: Technician[];
  onStatusToggle: (id: string, newStatus: string) => void;
  onUpdate: (id: string, updatedData: Omit<Technician, 'id'>) => void;
  onRoleUpdate: (id: string, role: string, isAdmin: boolean) => void;
}

const TechnicianList = ({ technicians, onStatusToggle, onUpdate, onRoleUpdate }: TechnicianListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Current Technicians</h3>
      <div className="divide-y divide-gray-200">
        {technicians?.map((technician) => (
          <div
            key={technician.id}
            className={`flex items-center justify-between py-4 ${technician.status === 'inactive' ? 'opacity-60' : ''}`}
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
                <Badge variant={technician.status === 'active' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {technician.status === 'active' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                  {technician.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {technician.specialization}
              </p>
              <p className="text-sm text-muted-foreground">
                {technician.email} • {technician.phone}
              </p>
              {technician.company_name && (
                <p className="text-sm text-muted-foreground">
                  Company: {technician.company_name}
                </p>
              )}
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
                variant={technician.status === 'active' ? 'secondary' : 'default'}
                size="sm"
                onClick={() => onStatusToggle(technician.id, technician.status === 'active' ? 'inactive' : 'active')}
              >
                {technician.status === 'active' ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicianList;

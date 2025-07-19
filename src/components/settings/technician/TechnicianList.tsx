
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, User, UserCheck, UserX, Trash2 } from "lucide-react";
import { Technician } from "@/types/technician";
import EditTechnicianDialog from "./EditTechnicianDialog";
import EditRoleDialog from "./EditRoleDialog";
import IndividualAccountManager from "./IndividualAccountManager";

interface TechnicianListProps {
  technicians: Technician[];
  onStatusToggle: (id: string, newStatus: string) => void;
  onUpdate: (id: string, updatedData: Omit<Technician, 'id'>) => void;
  onRoleUpdate: (id: string, role: string, isAdmin: boolean) => void;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
}

const TechnicianList = ({ 
  technicians, 
  onStatusToggle, 
  onUpdate, 
  onRoleUpdate, 
  onDelete, 
  showDeleteButton = false 
}: TechnicianListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Current Technicians</h3>
      <div className="divide-y divide-gray-200">
        {technicians?.map((technician) => (
          <div
            key={technician.id}
            className={`flex flex-col lg:flex-row items-start lg:items-center justify-between py-4 gap-4 ${
              technician.status === 'inactive' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
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
              <p className="text-sm text-muted-foreground mb-1">
                {technician.specialization}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                {technician.email} • {technician.phone}
              </p>
              {technician.company_name && (
                <p className="text-sm text-muted-foreground mb-2">
                  Company: {technician.company_name}
                </p>
              )}
              
              {/* Account Status Section */}
              <div className="mb-2">
                <p className="text-xs text-muted-foreground mb-1">Account Status:</p>
                <IndividualAccountManager technician={technician} />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
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
              {showDeleteButton && onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${technician.firstName} ${technician.lastName}? This action cannot be undone.`)) {
                      onDelete(technician.id);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicianList;

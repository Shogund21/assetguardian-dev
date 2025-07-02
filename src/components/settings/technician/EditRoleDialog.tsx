import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, User } from "lucide-react";

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

interface EditRoleDialogProps {
  technician: Technician;
  onRoleUpdate: (id: string, role: string, isAdmin: boolean) => void;
}

const EditRoleDialog = ({ technician, onRoleUpdate }: EditRoleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(technician.userRole || 'technician');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = selectedRole === 'admin';
    onRoleUpdate(technician.id, selectedRole, isAdmin);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {technician.userRole === 'admin' ? <Shield className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />}
          Edit Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for {technician.firstName} {technician.lastName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technician">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Technician
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedRole === 'admin' ? (
              <p>Admin users have full access to all features including user management and system settings.</p>
            ) : (
              <p>Technician users have access to equipment management, maintenance checks, and analytics.</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 text-black hover:bg-blue-600">
              Update Role
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuditService } from "@/services/auditService";
import TechnicianForm from "./technician/TechnicianForm";
import TechnicianList from "./technician/TechnicianList";

interface TechnicianFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  userRole: string;
}

const TechnicianManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TechnicianFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    userRole: "technician",
  });

  const { data: technicians, isLoading } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_technicians_with_roles');
      if (error) throw error;
      return data;
    },
  });

  const addTechnicianMutation = useMutation({
    mutationFn: async (newTechnician: TechnicianFormData) => {
      const { userRole, ...technicianData } = newTechnician;
      
      // First create the technician
      const { data: technician, error } = await supabase
        .from("technicians")
        .insert([{ ...technicianData, user_role: userRole }])
        .select()
        .single();
      if (error) throw error;

      // Then update their role using the function
      const { error: roleError } = await supabase.rpc('update_technician_role', {
        p_technician_id: technician.id,
        p_new_role: userRole,
        p_is_admin: userRole === 'admin'
      });
      if (roleError) throw roleError;

      // Log the action for audit
      await AuditService.logCreate('technicians', technician.id, technician, 'Added new technician with role assignment');

      return technician;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Success",
        description: "Technician added successfully",
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialization: "",
        userRole: "technician",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add technician: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateTechnicianMutation = useMutation({
    mutationFn: async ({ id, updatedData }: { id: string; updatedData: Omit<TechnicianFormData, 'userRole'> }) => {
      const { data, error } = await supabase
        .from("technicians")
        .update(updatedData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      
      // Log the update for audit
      await AuditService.logUpdate('technicians', id, {}, updatedData, 'Updated technician information');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Success",
        description: "Technician updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update technician: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTechnicianMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get technician data for audit log
      const { data: technician } = await supabase
        .from("technicians")
        .select("*")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("technicians")
        .delete()
        .eq("id", id);
      if (error) throw error;
      
      // Log the deletion for audit
      if (technician) {
        await AuditService.logDelete('technicians', id, technician, 'Removed technician from system');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Success",
        description: "Technician removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove technician: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTechnicianMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({ ...prev, userRole: role }));
  };

  const handleUpdate = (id: string, updatedData: Omit<TechnicianFormData, 'userRole'>) => {
    updateTechnicianMutation.mutate({ id, updatedData });
  };

  const handleRoleUpdate = async (id: string, role: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase.rpc('update_technician_role', {
        p_technician_id: id,
        p_new_role: role,
        p_is_admin: isAdmin
      });
      
      if (error) throw error;
      
      // Log role change for audit
      await AuditService.logUpdate('technicians', id, {}, { role, isAdmin }, `Role changed to ${role}`);
      
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Success",
        description: `Role updated to ${role}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update role: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this technician?")) {
      deleteTechnicianMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <TechnicianForm
        formData={formData}
        onInputChange={handleInputChange}
        onRoleChange={handleRoleChange}
        onSubmit={handleSubmit}
      />
      <TechnicianList
        technicians={technicians || []}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onRoleUpdate={handleRoleUpdate}
      />
    </div>
  );
};

export default TechnicianManagement;

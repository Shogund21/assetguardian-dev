
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuditService } from "@/services/auditService";
import { Technician } from "@/types/technician";
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/hooks/useAuth";
import TechnicianForm from "./technician/TechnicianForm";
import TechnicianList from "./technician/TechnicianList";
import BulkAccountCreator from "./technician/BulkAccountCreator";

interface TechnicianFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  userRole: string;
  company_id?: string;
  company_name?: string;
}

const TechnicianManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { companies } = useCompany();
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState<TechnicianFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    userRole: "technician",
    company_id: "none",
    company_name: "",
  });

  const { data: technicians, isLoading } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_technicians_with_roles');
      if (error) throw error;
      
      // Transform snake_case to camelCase to match our interface
      return data?.map((tech: any) => ({
        id: tech.id,
        firstName: tech.firstName,
        lastName: tech.lastName,
        email: tech.email,
        phone: tech.phone,
        specialization: tech.specialization,
        company_id: tech.company_id,
        userRole: tech.user_role || 'technician',
        isAdmin: tech.is_admin || false,
        company_name: tech.company_name,
        status: tech.status || 'active',
        isAvailable: tech.isAvailable !== false
      })) || [];
    },
  });

  const addTechnicianMutation = useMutation({
    mutationFn: async (newTechnician: TechnicianFormData) => {
      const { userRole, company_id, company_name, ...technicianData } = newTechnician;
      
      // Check if email already exists
      const { data: existingTechnician } = await supabase
        .from("technicians")
        .select("email")
        .eq("email", newTechnician.email)
        .single();

      if (existingTechnician) {
        throw new Error("A technician with this email already exists");
      }
      
      // Prepare technician data with proper company handling
      const technicianPayload = {
        ...technicianData,
        user_role: userRole,
        company_id: company_id === "none" ? null : company_id,
        company_name: company_id === "none" ? "" : company_name,
      };
      
      // First create the technician
      const { data: technician, error } = await supabase
        .from("technicians")
        .insert([technicianPayload])
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
        company_id: "none",
        company_name: "",
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
    mutationFn: async ({ id, updatedData }: { id: string; updatedData: Omit<Technician, 'id'> }) => {
      const { data, error } = await supabase
        .from("technicians")
        .update({
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          email: updatedData.email,
          phone: updatedData.phone,
          specialization: updatedData.specialization,
          company_id: updatedData.company_id,
          company_name: updatedData.company_name,
        })
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

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      // Get technician data for audit log
      const { data: technician } = await supabase
        .from("technicians")
        .select("*")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("technicians")
        .update({ status: newStatus })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      
      // Log the status change for audit
      if (technician) {
        await AuditService.logUpdate('technicians', id, { status: technician.status }, { status: newStatus }, `Status changed to ${newStatus}`);
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Success",
        description: `Technician ${variables.newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update technician status: " + error.message,
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

  const handleCompanyChange = (companyId: string) => {
    const selectedCompany = companies.find(c => c.id === companyId);
    setFormData((prev) => ({ 
      ...prev, 
      company_id: companyId,
      company_name: companyId === "none" ? "" : (selectedCompany?.name || ""),
    }));
  };

  const handleUpdate = (id: string, updatedData: Omit<Technician, 'id'>) => {
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

  const handleStatusToggle = async (id: string, newStatus: string) => {
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} this technician?`)) {
      toggleStatusMutation.mutate({ id, newStatus });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {isAdmin() && <BulkAccountCreator />}
      <TechnicianForm
        formData={formData}
        onInputChange={handleInputChange}
        onRoleChange={handleRoleChange}
        onCompanyChange={handleCompanyChange}
        onSubmit={handleSubmit}
      />
      <TechnicianList
        technicians={technicians || []}
        onStatusToggle={handleStatusToggle}
        onUpdate={handleUpdate}
        onRoleUpdate={handleRoleUpdate}
      />
    </div>
  );
};

export default TechnicianManagement;

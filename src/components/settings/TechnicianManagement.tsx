
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TechnicianForm from "./technician/TechnicianForm";
import TechnicianList from "./technician/TechnicianList";

interface TechnicianFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
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
  });

  const { data: technicians, isLoading } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .order("firstName");
      if (error) throw error;
      return data;
    },
  });

  const addTechnicianMutation = useMutation({
    mutationFn: async (newTechnician: TechnicianFormData) => {
      const { data, error } = await supabase
        .from("technicians")
        .insert([newTechnician])
        .select()
        .single();
      if (error) throw error;
      return data;
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
    mutationFn: async ({ id, updatedData }: { id: string; updatedData: TechnicianFormData }) => {
      const { data, error } = await supabase
        .from("technicians")
        .update(updatedData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
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
      const { error } = await supabase
        .from("technicians")
        .delete()
        .eq("id", id);
      if (error) throw error;
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

  const handleUpdate = (id: string, updatedData: TechnicianFormData) => {
    updateTechnicianMutation.mutate({ id, updatedData });
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
        onSubmit={handleSubmit}
      />
      <TechnicianList
        technicians={technicians || []}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default TechnicianManagement;

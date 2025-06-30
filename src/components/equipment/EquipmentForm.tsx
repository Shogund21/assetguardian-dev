
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FormFields from "./FormFields";
import FormActions from "./FormActions";
import { EquipmentFormData } from "@/types/equipment";

interface EquipmentFormProps {
  initialData?: Partial<EquipmentFormData>;
  onSubmit?: (data: EquipmentFormData) => Promise<void>;
  isEdit?: boolean;
}

export const EquipmentForm = ({ initialData, onSubmit, isEdit = false }: EquipmentFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<EquipmentFormData>({
    name: initialData?.name || "",
    location: initialData?.location || "",
    type: initialData?.type || "",
    status: initialData?.status || "Active",
    serial_number: initialData?.serial_number || "",
    model: initialData?.model || "",
  });

  const handleInputChange = (field: keyof EquipmentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Equipment name is required");
      }
      if (!formData.location.trim()) {
        throw new Error("Location is required");
      }
      if (!formData.type.trim()) {
        throw new Error("Equipment type is required");
      }

      console.log("Submitting equipment data:", formData);

      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default create behavior - only include fields that exist in database
        const equipmentData = {
          name: formData.name.trim(),
          location: formData.location.trim(),
          type: formData.type.trim(),
          status: formData.status || "Active",
          serial_number: formData.serial_number?.trim() || null,
          model: formData.model?.trim() || null,
        };

        console.log("Inserting equipment:", equipmentData);

        const { data, error } = await supabase
          .from('equipment')
          .insert([equipmentData])
          .select();

        if (error) {
          console.error("Database error:", error);
          throw error;
        }

        console.log("Equipment created successfully:", data);

        toast({
          title: "Success",
          description: "Equipment added successfully!",
        });

        navigate("/equipment");
      }
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save equipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Equipment" : "Add New Equipment"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormFields 
            formData={formData}
            onInputChange={handleInputChange}
          />
          
          <FormActions 
            isLoading={isLoading}
            isEdit={isEdit}
            onCancel={() => navigate("/equipment")}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default EquipmentForm;

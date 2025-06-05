
import React, { useState } from "react";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import MaintenanceBasicInfo from "./MaintenanceBasicInfo";
import { useMaintenanceForm } from "./hooks/useMaintenanceForm";
import { useMaintenanceFormSubmit } from "./hooks/useMaintenanceFormSubmit";
import { MaintenanceFormValues } from "./hooks/useMaintenanceForm";
import EquipmentFields from "./EquipmentFields";
import FormSubmitButtons from "./FormSubmitButtons";
import LoadingState from "./LoadingState";
import useFormValidation from "./hooks/useFormValidation";
import useEquipmentType from "./hooks/useEquipmentType";

interface MaintenanceCheckFormProps {
  onComplete: () => void;
}

const MaintenanceCheckForm = ({ onComplete }: MaintenanceCheckFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useMaintenanceForm();
  const handleSubmit = useMaintenanceFormSubmit(onComplete);
  const validateForm = useFormValidation();
  const { detectEquipmentType } = useEquipmentType();

  // Fetch equipment data
  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch technicians data
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('isAvailable', true);
      
      if (error) throw error;
      return data;
    },
  });

  // Form submission handler
  const onSubmit = async (values: MaintenanceFormValues) => {
    console.log('Form submission started with values:', values);
    
    if (isSubmitting) {
      console.log('Preventing double submission');
      return;
    }
    
    if (!validateForm(values)) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await handleSubmit(values);
    } finally {
      console.log('Form submission completed');
      setIsSubmitting(false);
    }
  };

  // Get selected equipment and determine type
  const selectedEquipment = equipment?.find(
    (eq) => eq.id === form.watch('equipment_id')
  );
  const equipmentType = detectEquipmentType(selectedEquipment);
  
  // Show loading state while data is being fetched
  const isLoading = isLoadingEquipment || isLoadingTechnicians;
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Form {...form}>
      <form 
        className="space-y-6 bg-white p-6 rounded-lg shadow"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form.getValues());
        }}
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <MaintenanceBasicInfo 
              form={form} 
              equipment={equipment || []} 
              technicians={technicians || []} 
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Equipment Maintenance Checklist</h2>
            <EquipmentFields form={form} equipmentType={equipmentType} />
          </div>
        </div>

        <FormSubmitButtons onCancel={onComplete} isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
};

export default MaintenanceCheckForm;

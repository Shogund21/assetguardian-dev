
import React, { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { MaintenanceCheck } from "@/types/maintenance";
import { useMaintenanceForm } from "./form/hooks/useMaintenanceForm";
import { useMaintenanceFormSubmit } from "./form/hooks/useMaintenanceFormSubmit";
import { useIsMobile } from "@/hooks/use-mobile";
import useFormValidation from "./form/hooks/useFormValidation";
import { MaintenanceFormProvider } from "./context/MaintenanceFormContext";
import MaintenanceFormHeader from "./form/layout/MaintenanceFormHeader";
import MaintenanceFormBody from "./form/layout/MaintenanceFormBody";
import FormActions from "./form/FormActions";
import { useMaintenanceFilterIntegration } from "./form/integration/useMaintenanceFilterIntegration";
import FilterChangePromptDialog from "./form/integration/FilterChangePromptDialog";

interface MaintenanceCheckFormProps {
  onComplete: () => void;
  initialData?: MaintenanceCheck;
  isSubmitting?: boolean;
  setIsSubmitting?: (isSubmitting: boolean) => void;
}

const MaintenanceCheckForm = ({ 
  onComplete, 
  initialData,
  isSubmitting: externalIsSubmitting,
  setIsSubmitting: externalSetIsSubmitting
}: MaintenanceCheckFormProps) => {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;
  const setIsSubmitting = externalSetIsSubmitting || setInternalIsSubmitting;
  
  const {
    showFilterPrompt,
    promptData,
    checkForFilterActions,
    handlePromptComplete,
    handlePromptClose
  } = useMaintenanceFilterIntegration();

  const form = useMaintenanceForm(initialData);
  const handleSubmit = useMaintenanceFormSubmit(
    onComplete, 
    initialData,
    checkForFilterActions
  );
  const validateForm = useFormValidation();
  const isMobile = useIsMobile();

  // Track form value changes for debugging
  const locationId = form.watch('location_id');
  const equipmentId = form.watch('equipment_id');
  const technicianId = form.watch('technician_id');

  useEffect(() => {
    console.log('Form values changed:', { 
      locationId, 
      equipmentId,
      technicianId,
      equipmentIdType: typeof equipmentId,
      equipmentIdValue: equipmentId
    });
  }, [locationId, equipmentId, technicianId]);

  // Log initialData to help with debugging
  useEffect(() => {
    if (initialData) {
      console.log('MaintenanceCheckForm initialData:', initialData);
    }
  }, [initialData]);

  // Fetch equipment data
  const { data: equipment = [], isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      console.log('Starting equipment fetch...');
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }
      
      console.log('Equipment fetched:', data);
      return data || [];
    },
  });

  // Fetch technicians data
  const { data: technicians = [], isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      console.log('Starting technicians fetch...');
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('isAvailable', true)
        .order('firstName');
      
      if (error) {
        console.error('Error fetching technicians:', error);
        throw error;
      }
      
      console.log('Technicians fetched:', data?.length || 0, 'technicians');
      return data || [];
    },
  });

  // FIXED: Properly find selected equipment using clean string comparison
  const selectedEquipment = equipment?.find((eq) => {
    const formEquipmentId = typeof equipmentId === 'string' ? equipmentId : String(equipmentId || '');
    const isMatch = eq.id === formEquipmentId;
    if (isMatch) {
      console.log('Found selected equipment:', eq.name, 'with ID:', eq.id);
    }
    return isMatch;
  });

  // FIXED: Improved equipment type detection with better logging
  const getEquipmentType = () => {
    if (!selectedEquipment) {
      console.log('No selected equipment for type detection');
      return null;
    }
    
    const name = selectedEquipment.name.toLowerCase();
    console.log('Detecting equipment type for:', name);
    
    let detectedType = null;
    if (name.includes('ahu') || name.includes('air handler')) detectedType = 'ahu';
    else if (name.includes('chiller')) detectedType = 'chiller';
    else if (name.includes('rtu') || name.includes('rooftop')) detectedType = 'rtu';
    else if (name.includes('cooling tower')) detectedType = 'cooling_tower';
    else if (name.includes('elevator')) detectedType = 'elevator';
    else if (name.includes('restroom')) detectedType = 'restroom';
    else detectedType = 'general';
    
    console.log('Equipment type detected:', detectedType);
    return detectedType;
  };

  const equipmentType = getEquipmentType();

  // Additional debugging for context values
  useEffect(() => {
    console.log('Context values debug:', {
      selectedEquipment: selectedEquipment?.name || 'None',
      equipmentType,
      techniciansCount: technicians?.length || 0,
      equipmentCount: equipment?.length || 0
    });
  }, [selectedEquipment, equipmentType, technicians, equipment]);

  const onSubmitForm = async (values: any) => {
    console.log('Form submission initiated with values:', values);
    console.log('Is update mode:', !!initialData);
    
    if (isSubmitting) {
      console.log('Preventing double submission');
      return;
    }
    
    // Validate form before submission
    if (!validateForm(values, equipmentType)) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Log values before submission to verify location_id is present
      console.log('Form values before submission:', {
        ...values,
        location_id_present: !!values.location_id
      });
      
      await handleSubmit(values);
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      console.log('Form submission completed');
      setIsSubmitting(false);
    }
  };

  // Manual form submission handler for the button click
  const manualSubmit = () => {
    console.log('Manual submit triggered');
    console.log('Current form values:', form.getValues());
    form.handleSubmit(onSubmitForm)();
  };

  if (isLoadingEquipment || isLoadingTechnicians) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <>
      <MaintenanceFormProvider
        form={form}
        initialData={initialData}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        equipment={equipment}
        technicians={technicians}
        selectedEquipment={selectedEquipment}
        equipmentType={equipmentType}
        isMobile={isMobile}
      >
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmitForm)} 
            className={`space-y-6 ${isMobile ? 'mobile-form-container' : ''}`}
          >
            <div className="grid gap-6">
              <MaintenanceFormHeader initialData={initialData} isMobile={isMobile} />
              <MaintenanceFormBody />
              <FormActions 
                onCancel={onComplete}
                isEditing={!!initialData}
                isSubmitting={isSubmitting}
                onSubmit={manualSubmit}
              />
            </div>
          </form>
        </Form>
      </MaintenanceFormProvider>

      {/* Filter Change Integration */}
      {showFilterPrompt && promptData && (
        <FilterChangePromptDialog
          open={showFilterPrompt}
          onOpenChange={handlePromptClose}
          equipmentId={promptData.equipmentId}
          equipmentName={promptData.equipmentName}
          maintenanceData={promptData.maintenanceData}
          onComplete={handlePromptComplete}
        />
      )}
    </>
  );
};

export default MaintenanceCheckForm;

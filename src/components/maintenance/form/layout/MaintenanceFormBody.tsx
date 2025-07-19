
import React from 'react';
import FormSection from '../FormSection';
import MaintenanceBasicInfo from '../MaintenanceBasicInfo';
import { useMaintenanceFormContext } from '../../context/MaintenanceFormContext';
import DocumentManager from '../../documents/DocumentManager';
import EquipmentTypeFields from './EquipmentTypeFields';
import CommentsSection from '../CommentsSection';

const MaintenanceFormBody = () => {
  const { form, equipment, technicians } = useMaintenanceFormContext();

  return (
    <>
      <FormSection title="Basic Information">
        <MaintenanceBasicInfo 
          form={form} 
          equipment={equipment} 
          technicians={technicians} 
        />
      </FormSection>
      
      <FormSection title="Equipment Maintenance Checklist">
        <EquipmentTypeFields />
      </FormSection>

      <FormSection title="Documents">
        <DocumentManager equipmentId={form.watch('equipment_id')} />
      </FormSection>

      <FormSection title="Comments & Notes">
        <CommentsSection />
      </FormSection>
    </>
  );
};

export default MaintenanceFormBody;

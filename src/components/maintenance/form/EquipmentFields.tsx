import React from "react";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";
import MaintenanceFrequencySelector from "./MaintenanceFrequencySelector";
import TieredEquipmentFields from "./TieredEquipmentFields";
import ElevatorMaintenanceFields from "./ElevatorMaintenanceFields";
import RestroomMaintenanceFields from "./RestroomMaintenanceFields";
import RTUMaintenanceFields from "./RTUMaintenanceFields";

interface EquipmentFieldsProps {
  form: UseFormReturn<MaintenanceFormValues>;
  equipmentType: string | null;
}

const EquipmentFields = ({ form, equipmentType }: EquipmentFieldsProps) => {
  console.log('Rendering EquipmentFields with type:', equipmentType);
  
  // Use tiered maintenance for chiller and AHU
  if (equipmentType === 'chiller' || equipmentType === 'ahu') {
    return (
      <div className="space-y-6">
        <MaintenanceFrequencySelector form={form} equipmentType={equipmentType} />
        <TieredEquipmentFields form={form} equipmentType={equipmentType} />
      </div>
    );
  }
  
  // Keep existing logic for other equipment types
  if (equipmentType === 'rtu') {
    return <RTUMaintenanceFields form={form} />;
  }
  
  if (equipmentType === 'elevator') {
    return <ElevatorMaintenanceFields form={form} />;
  }
  
  if (equipmentType === 'restroom') {
    return <RestroomMaintenanceFields form={form} />;
  }
  
  // Default or general equipment (includes cooling_tower)
  return (
    <div className="space-y-6">
      <MaintenanceFrequencySelector form={form} equipmentType={equipmentType} />
      <TieredEquipmentFields form={form} equipmentType={equipmentType} />
    </div>
  );
};

export default EquipmentFields;

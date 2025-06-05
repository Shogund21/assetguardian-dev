
import React from 'react';
import { useMaintenanceFormContext } from '../../context/MaintenanceFormContext';
import MaintenanceReadings from '../MaintenanceReadings';
import MaintenanceStatus from '../MaintenanceStatus';
import MaintenanceObservations from '../MaintenanceObservations';
import AHUMaintenanceFields from '../AHUMaintenanceFields';
import ElevatorMaintenanceFields from '../ElevatorMaintenanceFields';
import RestroomMaintenanceFields from '../RestroomMaintenanceFields';
import CoolingTowerFields from '../CoolingTowerFields';
import ChillerMaintenanceFields from '../ChillerMaintenanceFields';
import RTUMaintenanceFields from '../RTUMaintenanceFields';

const EquipmentTypeFields = () => {
  const { form, equipmentType, selectedEquipment } = useMaintenanceFormContext();
  
  console.log('EquipmentTypeFields - equipmentType:', equipmentType);
  console.log('EquipmentTypeFields - selectedEquipment:', selectedEquipment);
  
  // If no equipment is selected, show a message
  if (!selectedEquipment) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Please select equipment to view the maintenance checklist</p>
      </div>
    );
  }
  
  // Render appropriate fields based on equipment type
  switch (equipmentType) {
    case 'ahu':
      return <AHUMaintenanceFields form={form} />;
    case 'chiller':
      return <ChillerMaintenanceFields form={form} />;
    case 'rtu':
      return <RTUMaintenanceFields form={form} />;
    case 'cooling_tower':
      return <CoolingTowerFields form={form} />;
    case 'elevator':
      return <ElevatorMaintenanceFields form={form} />;
    case 'restroom':
      return <RestroomMaintenanceFields form={form} />;
    default:
      return (
        <>
          <MaintenanceReadings form={form} />
          <MaintenanceStatus form={form} />
          <MaintenanceObservations form={form} />
        </>
      );
  }
};

export default EquipmentTypeFields;

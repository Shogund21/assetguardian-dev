
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
  const { form, equipmentType } = useMaintenanceFormContext();
  
  console.log('Rendering EquipmentTypeFields with type:', equipmentType);
  
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

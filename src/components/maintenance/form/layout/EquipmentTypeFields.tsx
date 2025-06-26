
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
import ComprehensiveChillerFields from '../ComprehensiveChillerFields';

const EquipmentTypeFields = () => {
  const { form, equipmentType, selectedEquipment } = useMaintenanceFormContext();
  
  console.log('EquipmentTypeFields render:', {
    equipmentType,
    selectedEquipmentName: selectedEquipment?.name || 'None',
    selectedEquipmentId: selectedEquipment?.id || 'None'
  });
  
  // If no equipment is selected, show a message
  if (!selectedEquipment) {
    console.log('No equipment selected, showing placeholder');
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Please select equipment to view the maintenance checklist</p>
      </div>
    );
  }
  
  console.log('Rendering fields for equipment type:', equipmentType);
  
  // Check if this is a comprehensive chiller that needs the detailed form
  const isComprehensiveChiller = selectedEquipment?.name?.toLowerCase().includes('chiller') ||
                                 selectedEquipment?.name?.toLowerCase().includes('trane') ||
                                 equipmentType === 'chiller';
  
  // Render appropriate fields based on equipment type
  switch (equipmentType) {
    case 'ahu':
      console.log('Rendering AHU fields');
      return <AHUMaintenanceFields form={form} />;
    case 'chiller':
      console.log('Rendering Comprehensive Chiller fields');
      return <ComprehensiveChillerFields form={form} />;
    case 'rtu':
      console.log('Rendering RTU fields');
      return <RTUMaintenanceFields form={form} />;
    case 'cooling_tower':
      console.log('Rendering Cooling Tower fields');
      return <CoolingTowerFields form={form} />;
    case 'elevator':
      console.log('Rendering Elevator fields');
      return <ElevatorMaintenanceFields form={form} />;
    case 'restroom':
      console.log('Rendering Restroom fields');
      return <RestroomMaintenanceFields form={form} />;
    default:
      // If it's a chiller but not categorized properly, still show comprehensive form
      if (isComprehensiveChiller) {
        console.log('Rendering Comprehensive Chiller fields for uncategorized chiller');
        return <ComprehensiveChillerFields form={form} />;
      }
      
      console.log('Rendering default/general fields for type:', equipmentType);
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

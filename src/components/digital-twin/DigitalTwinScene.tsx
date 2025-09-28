import React, { useMemo } from 'react';
import { DigitalTwinFacility } from '@/types/digitalTwin';
import { DigitalTwinThreeScene } from './DigitalTwinThreeScene';

interface DigitalTwinSceneProps {
  facility: DigitalTwinFacility;
  selectedEquipment?: string;
  onEquipmentSelect: (equipmentId: string) => void;
  showEnergyFlow: boolean;
  showSensors: boolean;
  orbitControlsRef: React.RefObject<any>;
  isTransitioning: boolean;
  maintenanceMode?: boolean;
  maintenanceEquipment?: Array<any>;
}

export const DigitalTwinScene: React.FC<DigitalTwinSceneProps> = ({
  facility,
  selectedEquipment,
  onEquipmentSelect,
  showEnergyFlow,
  showSensors,
  orbitControlsRef,
  isTransitioning,
  maintenanceMode = false,
  maintenanceEquipment = [],
}) => {
  const equipmentPositions = useMemo(() => {
    return facility.equipment.reduce((acc, equipment) => {
      acc[equipment.id] = equipment.position;
      return acc;
    }, {} as Record<string, { x: number; y: number; z: number }>);
  }, [facility.equipment]);

  return (
    <div className="w-full h-full">
        <DigitalTwinThreeScene
          facility={facility}
          selectedEquipment={selectedEquipment}
          onEquipmentSelect={onEquipmentSelect}
          showEnergyFlow={showEnergyFlow}
          showSensors={showSensors}
          orbitControlsRef={orbitControlsRef}
          isTransitioning={isTransitioning}
          maintenanceMode={maintenanceMode}
          maintenanceEquipment={maintenanceEquipment}
        />
    </div>
  );
};
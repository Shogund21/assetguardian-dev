import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Equipment3D } from './Equipment3D';
import { EnergyFlowVisualization } from './EnergyFlowVisualization';
import { DigitalTwinFacility } from '@/types/digitalTwin';
import { Loader2 } from 'lucide-react';
import Sanitize3D from './Sanitize3D';
import { G, M, SphereGeom, BasicMat, ALight, DLight, PCam, Controls, Env, SafeGrid } from './Safe3D';

interface DigitalTwinSceneProps {
  facility: DigitalTwinFacility;
  selectedEquipment?: string;
  onEquipmentSelect: (equipmentId: string) => void;
  showEnergyFlow: boolean;
  showSensors: boolean;
  orbitControlsRef: React.RefObject<any>;
  isTransitioning: boolean;
}

export const DigitalTwinScene: React.FC<DigitalTwinSceneProps> = ({
  facility,
  selectedEquipment,
  onEquipmentSelect,
  showEnergyFlow,
  showSensors,
  orbitControlsRef,
  isTransitioning,
}) => {
  const equipmentPositions = useMemo(() => {
    return facility.equipment.reduce((acc, equipment) => {
      acc[equipment.id] = equipment.position;
      return acc;
    }, {} as Record<string, { x: number; y: number; z: number }>);
  }, [facility.equipment]);

  // TEMPORARY: R3F Error Boundary fallback
  try {
    return (
      <div className="h-full w-full bg-background rounded-lg overflow-hidden border">
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-foreground">Digital Twin Preview</div>
            <div className="text-muted-foreground">
              3D visualization temporarily unavailable due to compatibility issues
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm space-y-2">
                <div><strong>Facility:</strong> {facility.name}</div>
                <div><strong>Equipment Count:</strong> {facility.equipment.length}</div>
                <div><strong>Total Energy Flow:</strong> {facility.energyFlow?.length || 0} connections</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('DigitalTwinScene error:', error);
    return (
      <div className="h-full w-full bg-background rounded-lg overflow-hidden border flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-destructive">3D Scene Error</div>
          <div className="text-sm text-muted-foreground">Unable to render 3D visualization</div>
        </div>
      </div>
    );
  }
};
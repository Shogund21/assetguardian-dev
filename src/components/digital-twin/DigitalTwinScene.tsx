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

  return (
    <div className="h-full w-full bg-background rounded-lg overflow-hidden border">
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center space-y-6 max-w-2xl mx-auto p-8">
          <div className="text-3xl font-bold text-foreground">Digital Twin Dashboard</div>
          <div className="text-muted-foreground">
            3D visualization is currently unavailable due to platform compatibility issues.
          </div>
          
          {/* Facility Information */}
          <div className="bg-muted p-6 rounded-lg space-y-4">
            <h3 className="text-xl font-semibold text-foreground">{facility.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-background p-3 rounded">
                <div className="font-medium text-foreground">Equipment</div>
                <div className="text-2xl font-bold text-primary">{facility.equipment.length}</div>
              </div>
              <div className="bg-background p-3 rounded">
                <div className="font-medium text-foreground">Energy Flows</div>
                <div className="text-2xl font-bold text-primary">{facility.energyFlow?.length || 0}</div>
              </div>
              <div className="bg-background p-3 rounded">
                <div className="font-medium text-foreground">Dimensions</div>
                <div className="text-lg font-bold text-primary">
                  {facility.dimensions.width}×{facility.dimensions.length}m
                </div>
              </div>
            </div>
          </div>

          {/* Equipment List */}
          <div className="bg-muted p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-foreground mb-4">Equipment Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {facility.equipment.map((equipment) => (
                <div 
                  key={equipment.id} 
                  className={`bg-background p-3 rounded border-l-4 cursor-pointer transition-colors ${
                    selectedEquipment === equipment.id 
                      ? 'border-l-primary bg-primary/5' 
                      : equipment.status === 'operational' 
                        ? 'border-l-green-500' 
                        : equipment.status === 'needs_attention'
                          ? 'border-l-yellow-500'
                          : 'border-l-red-500'
                  }`}
                  onClick={() => onEquipmentSelect(equipment.id)}
                >
                  <div className="font-medium text-foreground">{equipment.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">{equipment.type}</div>
                  <div className="text-sm">
                    Health: <span className="font-medium">{equipment.healthScore}%</span>
                  </div>
                  {equipment.alerts.length > 0 && (
                    <div className="text-xs text-orange-600 mt-1">
                      {equipment.alerts.length} alert(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Note about 3D */}
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded border">
            <strong>Note:</strong> The 3D visualization feature requires compatibility updates. 
            All facility data and controls remain fully functional in this dashboard view.
          </div>
        </div>
      </div>
    </div>
  );
};
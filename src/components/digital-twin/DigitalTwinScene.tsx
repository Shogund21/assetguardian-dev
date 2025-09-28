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
      <Canvas
        shadows
        className="h-full w-full"
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <Sanitize3D>
          <PCam
            makeDefault
            position={[20, 15, 20]}
            fov={60}
          />
          
          <ALight intensity={0.4} />
          <DLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
          />
          
          <Suspense fallback={null}>
            <Env preset="warehouse" />
            
            {/* Facility Floor Grid */}
            <SafeGrid
              args={[facility.dimensions.width, facility.dimensions.length]}
              position={[0, 0, 0]}
              cellSize={2}
              cellThickness={0.5}
              cellColor="#6366f1"
              sectionSize={10}
              sectionThickness={1}
              sectionColor="#4f46e5"
              fadeDistance={50}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={false}
            />
            
            {/* Equipment 3D Models */}
            {facility.equipment.map((equipment) => (
              <Equipment3D
                key={equipment.id}
                equipment={equipment}
                isSelected={selectedEquipment === equipment.id}
                onSelect={() => onEquipmentSelect(equipment.id)}
              />
            ))}
            
            {/* Energy Flow Visualization */}
            {showEnergyFlow && facility.energyFlow && (
              <EnergyFlowVisualization
                energyFlows={facility.energyFlow}
                equipmentPositions={equipmentPositions}
              />
            )}
            
            {/* Sensor data display - simplified without HTML overlay */}
            {showSensors && facility.equipment.map((eq) => (
              <G key={`sensor-${eq.id}`} position={[eq.position.x, eq.position.y + 4, eq.position.z]}>
                <M>
                  <SphereGeom args={[0.1]} />
                  <BasicMat 
                    color={eq.healthScore > 70 ? '#10b981' : eq.healthScore > 30 ? '#f59e0b' : '#ef4444'} 
                  />
                </M>
              </G>
            ))}
            
            <Controls
              ref={orbitControlsRef}
              enablePan={!isTransitioning}
              enableZoom={!isTransitioning}
              enableRotate={!isTransitioning}
              minDistance={5}
              maxDistance={100}
              maxPolarAngle={Math.PI / 2.1}
              dampingFactor={0.05}
              enableDamping={true}
            />
          </Suspense>
        </Sanitize3D>
      </Canvas>
      
      {/* Loading indicator */}
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="flex items-center gap-2 text-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading Digital Twin...</span>
            </div>
          </div>
        }
      />
    </div>
  );
};
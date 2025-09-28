import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TubeGeom, StdMat, SphereGeom, G, M } from './Safe3D';

interface EnergyFlowVisualizationProps {
  energyFlows: {
    from: string;
    to: string;
    flow: number;
    efficiency: number;
    color: string;
  }[];
  equipmentPositions: Record<string, { x: number; y: number; z: number }>;
}

export const EnergyFlowVisualization: React.FC<EnergyFlowVisualizationProps> = ({
  energyFlows,
  equipmentPositions,
}) => {
  const getFlowColor = (efficiency: number) => {
    if (efficiency >= 0.8) return '#10b981'; // green
    if (efficiency >= 0.6) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const flowLines = useMemo(() => {
    return energyFlows
      .map((flow) => {
        const fromPos = equipmentPositions[flow.from];
        const toPos = equipmentPositions[flow.to];

        if (!fromPos || !toPos) return null;

        // Create curved line between equipment
        const midPoint = new THREE.Vector3(
          (fromPos.x + toPos.x) / 2,
          Math.max(fromPos.y, toPos.y) + 2,
          (fromPos.z + toPos.z) / 2
        );

        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(fromPos.x, fromPos.y + 1, fromPos.z),
          midPoint,
          new THREE.Vector3(toPos.x, toPos.y + 1, toPos.z)
        );

        const points = curve.getPoints(20);

        return {
          curve,
          points,
          flow,
          color: getFlowColor(flow.efficiency),
          radius: Math.max(0.03, flow.flow / 600),
        };
      })
      .filter(Boolean);
  }, [energyFlows, equipmentPositions]);

  return (
    <G>
      {flowLines.map((line, index) => {
        if (!line) return null;
        
        return (
          <G key={index}>
            <M>
              <TubeGeom args={[line.curve, 64, line.radius, 8, false]} />
              <StdMat color={line.color} transparent opacity={0.7} />
            </M>

            {/* Flow direction indicators */}
            {line.points.map((point, pointIndex) => {
              if (pointIndex % 4 !== 0) return null;

              return (
                <M key={pointIndex} position={[point.x, point.y, point.z]}>
                  <SphereGeom args={[0.05]} />
                  <StdMat
                    color={line.color}
                    emissive={line.color}
                    emissiveIntensity={0.3}
                  />
                </M>
              );
            })}
          </G>
        );
      })}
    </G>
  );
};
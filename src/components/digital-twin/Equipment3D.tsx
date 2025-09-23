import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import { Mesh } from 'three';
import { DigitalTwinEquipment } from '@/types/digitalTwin';

interface Equipment3DProps {
  equipment: DigitalTwinEquipment;
  isSelected: boolean;
  onSelect: () => void;
}

export const Equipment3D: React.FC<Equipment3DProps> = ({
  equipment,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animate selected equipment
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const getEquipmentGeometry = () => {
    switch (equipment.type?.toLowerCase()) {
      case 'chiller':
        return (
          <Box args={[4, 3, 2]}>
            <meshStandardMaterial
              color={getStatusColor()}
              transparent
              opacity={hovered ? 0.8 : 1}
              emissive={isSelected ? '#4f46e5' : '#000000'}
              emissiveIntensity={isSelected ? 0.3 : 0}
            />
          </Box>
        );
      case 'ahu':
      case 'rtu':
        return (
          <Box args={[3, 2, 1.5]}>
            <meshStandardMaterial
              color={getStatusColor()}
              transparent
              opacity={hovered ? 0.8 : 1}
              emissive={isSelected ? '#4f46e5' : '#000000'}
              emissiveIntensity={isSelected ? 0.3 : 0}
            />
          </Box>
        );
      case 'cooling tower':
        return (
          <Cylinder args={[1.5, 1.5, 4, 8]}>
            <meshStandardMaterial
              color={getStatusColor()}
              transparent
              opacity={hovered ? 0.8 : 1}
              emissive={isSelected ? '#4f46e5' : '#000000'}
              emissiveIntensity={isSelected ? 0.3 : 0}
            />
          </Cylinder>
        );
      case 'generator':
        return (
          <Box args={[2.5, 1.5, 1]}>
            <meshStandardMaterial
              color={getStatusColor()}
              transparent
              opacity={hovered ? 0.8 : 1}
              emissive={isSelected ? '#4f46e5' : '#000000'}
              emissiveIntensity={isSelected ? 0.3 : 0}
            />
          </Box>
        );
      case 'split system':
        return (
          <Box args={[1, 0.5, 1.5]}>
            <meshStandardMaterial
              color={getStatusColor()}
              transparent
              opacity={hovered ? 0.8 : 1}
              emissive={isSelected ? '#4f46e5' : '#000000'}
              emissiveIntensity={isSelected ? 0.3 : 0}
            />
          </Box>
        );
      default:
        return (
          <Box args={[2, 2, 2]}>
            <meshStandardMaterial
              color={getStatusColor()}
              transparent
              opacity={hovered ? 0.8 : 1}
              emissive={isSelected ? '#4f46e5' : '#000000'}
              emissiveIntensity={isSelected ? 0.3 : 0}
            />
          </Box>
        );
    }
  };

  const getStatusColor = () => {
    switch (equipment.status) {
      case 'operational':
        return '#10b981'; // green
      case 'needs_attention':
        return '#f59e0b'; // amber
      case 'under_maintenance':
        return '#3b82f6'; // blue
      case 'offline':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getHealthIndicator = () => {
    if (equipment.healthScore < 30) return '#ef4444'; // red
    if (equipment.healthScore < 70) return '#f59e0b'; // amber
    return '#10b981'; // green
  };

  return (
    <group
      position={[equipment.position.x, equipment.position.y, equipment.position.z]}
      rotation={[equipment.rotation.x, equipment.rotation.y, equipment.rotation.z]}
      scale={[equipment.scale.x, equipment.scale.y, equipment.scale.z]}
    >
      {/* Main equipment mesh */}
      <mesh
        ref={meshRef}
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        {getEquipmentGeometry()}
      </mesh>
      
      {/* Health indicator sphere */}
      <Sphere
        args={[0.3]}
        position={[0, 2.5, 0]}
      >
        <meshStandardMaterial
          color={getHealthIndicator()}
          emissive={getHealthIndicator()}
          emissiveIntensity={0.3}
        />
      </Sphere>
      
      {/* Alert indicators */}
      {equipment.alerts.filter(alert => !alert.acknowledged).map((alert, index) => (
        <Sphere
          key={alert.id}
          args={[0.2]}
          position={[1 + index * 0.5, 3, 0]}
        >
          <meshStandardMaterial
            color={alert.type === 'critical' ? '#ef4444' : '#f59e0b'}
            emissive={alert.type === 'critical' ? '#ef4444' : '#f59e0b'}
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
};
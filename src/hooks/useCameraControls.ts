import { useRef, useState, useCallback } from 'react';
import { Vector3 } from 'three';
import { DigitalTwinEquipment } from '@/types/digitalTwin';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export const useCameraControls = (equipment: DigitalTwinEquipment[]) => {
  const orbitControlsRef = useRef<any>(null);
  const [currentPreset, setCurrentPreset] = useState<string>('overview');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const presets: Record<string, CameraPreset> = {
    overview: {
      position: [30, 25, 30],
      target: [0, 0, 0],
    },
    detail: {
      position: [15, 10, 15],
      target: [0, 0, 0],
    },
    maintenance: {
      position: [12, 8, 12],
      target: [0, 0, 0],
    },
  };

  const animateToPreset = useCallback(
    (preset: 'overview' | 'detail' | 'maintenance', selectedEquipmentId?: string) => {
      if (!orbitControlsRef.current) return;

      setIsTransitioning(true);
      setCurrentPreset(preset);

      const controls = orbitControlsRef.current;
      const camera = controls.object;

      let targetPreset = presets[preset];

      // For maintenance view, focus on equipment that needs attention
      if (preset === 'maintenance') {
        const maintenanceEquipment = equipment.find(
          eq => eq.status === 'needs_attention' || eq.status === 'under_maintenance'
        );
        if (maintenanceEquipment) {
          targetPreset = {
            position: [
              maintenanceEquipment.position.x + 8,
              maintenanceEquipment.position.y + 6,
              maintenanceEquipment.position.z + 8,
            ],
            target: [
              maintenanceEquipment.position.x,
              maintenanceEquipment.position.y,
              maintenanceEquipment.position.z,
            ],
          };
        }
      }

      // For detail view, focus on selected equipment if available
      if (preset === 'detail' && selectedEquipmentId) {
        const selectedEquipment = equipment.find(eq => eq.id === selectedEquipmentId);
        if (selectedEquipment) {
          targetPreset = {
            position: [
              selectedEquipment.position.x + 6,
              selectedEquipment.position.y + 4,
              selectedEquipment.position.z + 6,
            ],
            target: [
              selectedEquipment.position.x,
              selectedEquipment.position.y,
              selectedEquipment.position.z,
            ],
          };
        }
      }

      // Animate camera position
      const startPosition = camera.position.clone();
      const endPosition = new Vector3(...targetPreset.position);
      const startTarget = controls.target.clone();
      const endTarget = new Vector3(...targetPreset.target);

      const duration = 1500; // 1.5 seconds
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing function
        const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const easedProgress = easeInOut(progress);

        // Interpolate camera position
        camera.position.lerpVectors(startPosition, endPosition, easedProgress);

        // Interpolate camera target
        const currentTarget = new Vector3().lerpVectors(startTarget, endTarget, easedProgress);
        controls.target.copy(currentTarget);

        controls.update();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsTransitioning(false);
        }
      };

      animate();
    },
    [equipment, presets]
  );

  const resetView = useCallback(() => {
    animateToPreset('overview');
  }, [animateToPreset]);

  return {
    orbitControlsRef,
    currentPreset,
    isTransitioning,
    animateToPreset,
    resetView,
  };
};
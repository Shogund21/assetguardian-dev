import * as THREE from 'three';

interface ComponentDefinition {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

interface DetailedGeometry {
  mainGeometry: THREE.BufferGeometry;
  subComponents: ComponentDefinition[];
}

export const getDetailedEquipmentGeometry = (type: string): DetailedGeometry => {
  const subComponents: ComponentDefinition[] = [];
  let mainGeometry: THREE.BufferGeometry;

  // Create materials for different components
  const metalMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x888888, 
    shininess: 50,
    specular: 0x444444 
  });
  const pipeMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x666666,
    shininess: 30 
  });
  const fanMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x333333,
    shininess: 10 
  });

  switch (type?.toLowerCase()) {
    case 'chiller':
      // Main chiller body
      mainGeometry = new THREE.BoxGeometry(4, 3, 2);
      
      // Condenser coils
      subComponents.push({
        geometry: new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16),
        material: metalMaterial,
        position: new THREE.Vector3(0, 1.8, 1.2),
        rotation: new THREE.Euler(Math.PI / 2, 0, 0)
      });
      
      // Compressor
      subComponents.push({
        geometry: new THREE.CylinderGeometry(0.6, 0.6, 1.2, 8),
        material: metalMaterial,
        position: new THREE.Vector3(-1.2, -0.5, 0),
        rotation: new THREE.Euler(0, 0, 0)
      });
      
      // Pipes
      subComponents.push({
        geometry: new THREE.CylinderGeometry(0.1, 0.1, 3, 8),
        material: pipeMaterial,
        position: new THREE.Vector3(1.5, 0, 0),
        rotation: new THREE.Euler(0, 0, Math.PI / 2)
      });
      break;

    case 'ahu':
    case 'rtu':
      // Main AHU body
      mainGeometry = new THREE.BoxGeometry(3, 2, 1.5);
      
      // Fan (animated component)
      const fanGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 6);
      subComponents.push({
        geometry: fanGeometry,
        material: fanMaterial,
        position: new THREE.Vector3(0, 0, 0.8),
        rotation: new THREE.Euler(Math.PI / 2, 0, 0)
      });
      
      // Mark as fan for animation
      if (subComponents.length > 0) {
        (subComponents[subComponents.length - 1].geometry as any).userData = { isFan: true };
      }
      
      // Air intake grilles
      for (let i = 0; i < 3; i++) {
        subComponents.push({
          geometry: new THREE.BoxGeometry(0.8, 0.05, 1.2),
          material: metalMaterial,
          position: new THREE.Vector3(-1.2 + i * 0.4, 0.8, 0),
          rotation: new THREE.Euler(0, 0, 0)
        });
      }
      
      // Control panel
      subComponents.push({
        geometry: new THREE.BoxGeometry(0.3, 0.4, 0.1),
        material: new THREE.MeshPhongMaterial({ color: 0x222222 }),
        position: new THREE.Vector3(1.2, 0.5, 0),
        rotation: new THREE.Euler(0, 0, 0)
      });
      break;

    case 'cooling tower':
      // Main tower structure
      mainGeometry = new THREE.CylinderGeometry(2, 2.5, 4, 12);
      
      // Fan at top
      subComponents.push({
        geometry: new THREE.CylinderGeometry(1.5, 1.5, 0.2, 8),
        material: fanMaterial,
        position: new THREE.Vector3(0, 2.2, 0),
        rotation: new THREE.Euler(0, 0, 0)
      });
      
      // Water distribution system
      subComponents.push({
        geometry: new THREE.TorusGeometry(1.5, 0.1, 8, 16),
        material: pipeMaterial,
        position: new THREE.Vector3(0, 1.5, 0),
        rotation: new THREE.Euler(0, 0, 0)
      });
      
      // Support structure
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        subComponents.push({
          geometry: new THREE.CylinderGeometry(0.05, 0.05, 4, 6),
          material: metalMaterial,
          position: new THREE.Vector3(Math.cos(angle) * 2.2, 0, Math.sin(angle) * 2.2),
          rotation: new THREE.Euler(0, 0, 0)
        });
      }
      break;

    case 'generator':
      // Main generator body
      mainGeometry = new THREE.BoxGeometry(2.5, 1.5, 1);
      
      // Engine block
      subComponents.push({
        geometry: new THREE.BoxGeometry(1.5, 1, 0.8),
        material: metalMaterial,
        position: new THREE.Vector3(-0.3, 0, 0),
        rotation: new THREE.Euler(0, 0, 0)
      });
      
      // Exhaust pipe
      subComponents.push({
        geometry: new THREE.CylinderGeometry(0.1, 0.1, 2, 8),
        material: new THREE.MeshPhongMaterial({ color: 0x444444 }),
        position: new THREE.Vector3(0, 1.5, 0),
        rotation: new THREE.Euler(0, 0, 0)
      });
      
      // Control panel
      subComponents.push({
        geometry: new THREE.BoxGeometry(0.4, 0.6, 0.2),
        material: new THREE.MeshPhongMaterial({ color: 0x333333 }),
        position: new THREE.Vector3(1, 0.3, 0.6),
        rotation: new THREE.Euler(0, 0, 0)
      });
      break;

    case 'split system':
      // Main unit
      mainGeometry = new THREE.BoxGeometry(1, 0.5, 1.5);
      
      // Outdoor unit
      subComponents.push({
        geometry: new THREE.BoxGeometry(0.8, 0.4, 0.6),
        material: metalMaterial,
        position: new THREE.Vector3(0, -0.6, 0),
        rotation: new THREE.Euler(0, 0, 0)
      });
      
      // Connecting pipes
      subComponents.push({
        geometry: new THREE.CylinderGeometry(0.02, 0.02, 1, 6),
        material: pipeMaterial,
        position: new THREE.Vector3(0.2, -0.3, 0),
        rotation: new THREE.Euler(Math.PI / 2, 0, 0)
      });
      
      subComponents.push({
        geometry: new THREE.CylinderGeometry(0.03, 0.03, 1, 6),
        material: pipeMaterial,
        position: new THREE.Vector3(-0.2, -0.3, 0),
        rotation: new THREE.Euler(Math.PI / 2, 0, 0)
      });
      break;

    case 'pump':
      // Main pump body
      mainGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 12);
      
      // Motor
      subComponents.push({
        geometry: new THREE.CylinderGeometry(0.4, 0.4, 1, 8),
        material: metalMaterial,
        position: new THREE.Vector3(0, 1.2, 0),
        rotation: new THREE.Euler(0, 0, 0)
      });
      
      // Inlet pipe
      subComponents.push({
        geometry: new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8),
        material: pipeMaterial,
        position: new THREE.Vector3(-1.2, 0, 0),
        rotation: new THREE.Euler(0, 0, Math.PI / 2)
      });
      
      // Outlet pipe
      subComponents.push({
        geometry: new THREE.CylinderGeometry(0.25, 0.25, 2, 8),
        material: pipeMaterial,
        position: new THREE.Vector3(0, 0, 1.2),
        rotation: new THREE.Euler(Math.PI / 2, 0, 0)
      });
      break;

    default:
      // Generic equipment
      mainGeometry = new THREE.BoxGeometry(2, 2, 2);
      
      // Generic control panel
      subComponents.push({
        geometry: new THREE.BoxGeometry(0.3, 0.5, 0.1),
        material: new THREE.MeshPhongMaterial({ color: 0x222222 }),
        position: new THREE.Vector3(1.1, 0.2, 0),
        rotation: new THREE.Euler(0, 0, 0)
      });
      break;
  }

  return {
    mainGeometry,
    subComponents
  };
};
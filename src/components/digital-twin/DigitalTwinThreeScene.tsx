import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DigitalTwinFacility } from '@/types/digitalTwin';
import { getDetailedEquipmentGeometry } from './DetailedEquipmentGeometry';

interface DigitalTwinThreeSceneProps {
  facility: DigitalTwinFacility;
  selectedEquipment?: string;
  onEquipmentSelect: (equipmentId: string) => void;
  showEnergyFlow: boolean;
  showSensors: boolean;
  orbitControlsRef: React.RefObject<any>;
  isTransitioning: boolean;
}

export const DigitalTwinThreeScene: React.FC<DigitalTwinThreeSceneProps> = ({
  facility,
  selectedEquipment,
  onEquipmentSelect,
  showEnergyFlow,
  showSensors,
  orbitControlsRef,
  isTransitioning,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const equipmentMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const labelSpritesRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const sensorSpritesRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const energyFlowLinesRef = useRef<THREE.Group>();
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  useEffect(() => {
    if (!mountRef.current || !facility) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced OrbitControls setup for full 360° rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI; // Allow full vertical rotation
    controls.minPolarAngle = 0; // Allow looking from above
    controls.enablePan = true;
    controls.panSpeed = 0.8;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;
    // Set orbit controls ref for camera control hook
    (orbitControlsRef as any).current = controls;

    // Enhanced lighting system for realistic 3D depth
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(20, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    // Additional fill lights for better depth perception
    const fillLight1 = new THREE.DirectionalLight(0x4080ff, 0.3);
    fillLight1.position.set(-10, 10, -10);
    scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xff8040, 0.2);
    fillLight2.position.set(10, 5, -10);
    scene.add(fillLight2);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(facility.dimensions.width, facility.dimensions.length);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid
    const gridHelper = new THREE.GridHelper(facility.dimensions.width, 20, 0x444444, 0x444444);
    scene.add(gridHelper);

    // Enhanced Equipment with detailed 3D models
    facility.equipment.forEach((equipment) => {
      // Create composite equipment group
      const equipmentGroup = new THREE.Group();
      
      // Get detailed geometry based on equipment type
      const { mainGeometry, subComponents } = getDetailedEquipmentGeometry(equipment.type);
      
      const color = getEquipmentColor(equipment.status);
      const isNonWorking = equipment.status === 'offline' || equipment.status === 'under_maintenance';
      
      // Enhanced material with PBR-like properties
      const material = new THREE.MeshPhongMaterial({ 
        color,
        emissive: selectedEquipment === equipment.id ? 0x444444 : 0x000000,
        emissiveIntensity: isNonWorking ? 0.3 : 0.1,
        shininess: 30,
        specular: 0x222222
      });

      // Main equipment mesh
      const mainMesh = new THREE.Mesh(mainGeometry, material);
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      mainMesh.userData = { equipmentId: equipment.id };
      equipmentGroup.add(mainMesh);
      
      // Add sub-components for detailed equipment
      subComponents.forEach((component, index) => {
        const componentMesh = new THREE.Mesh(component.geometry, component.material);
        componentMesh.position.copy(component.position);
        componentMesh.rotation.copy(component.rotation);
        componentMesh.castShadow = true;
        componentMesh.receiveShadow = true;
        equipmentGroup.add(componentMesh);
      });
      
      // Position the entire equipment group
      equipmentGroup.position.set(
        equipment.position.x, 
        equipment.position.y + 1, 
        equipment.position.z
      );
      equipmentGroup.rotation.set(
        equipment.rotation.x,
        equipment.rotation.y,
        equipment.rotation.z
      );
      equipmentGroup.scale.set(
        equipment.scale.x,
        equipment.scale.y,
        equipment.scale.z
      );

      // Health indicator
      const healthColor = equipment.healthScore > 80 ? 0x00ff00 : 
                         equipment.healthScore > 50 ? 0xffff00 : 0xff0000;
      const healthSize = isNonWorking ? 0.3 : 0.2; // Larger for non-working equipment
      const healthGeometry = new THREE.SphereGeometry(healthSize);
      const healthMaterial = new THREE.MeshLambertMaterial({ 
        color: healthColor,
        emissive: healthColor,
        emissiveIntensity: isNonWorking ? 0.8 : 0.5
      });
      const healthIndicator = new THREE.Mesh(healthGeometry, healthMaterial);
      healthIndicator.position.set(0, 2.5, 0);
      healthIndicator.userData = { isNonWorking, originalIntensity: isNonWorking ? 0.8 : 0.5 };
      equipmentGroup.add(healthIndicator);

      // Alert indicators
      equipment.alerts.forEach((alert, index) => {
        const alertGeometry = new THREE.SphereGeometry(0.1);
        const alertColor = alert.type === 'critical' ? 0xff0000 : 0xffa500;
        const alertMaterial = new THREE.MeshLambertMaterial({ 
          color: alertColor,
          emissive: alertColor,
          emissiveIntensity: 0.8
        });
        const alertMesh = new THREE.Mesh(alertGeometry, alertMaterial);
        alertMesh.position.set(0.5 + index * 0.3, 3.2, 0);
        equipmentGroup.add(alertMesh);
      });

      scene.add(equipmentGroup);
      equipmentMeshesRef.current.set(equipment.id, mainMesh);

      // Add equipment name label with status indicator
      const labelText = isNonWorking ? `${equipment.name} - ${equipment.status.toUpperCase()}` : equipment.name;
      const nameSprite = createTextSprite(labelText, true, isNonWorking);
      nameSprite.position.set(0, 4, 0);
      equipmentGroup.add(nameSprite);
      labelSpritesRef.current.set(equipment.id, nameSprite);

      // Add sensor data sprite (initially hidden)
      const sensorText = equipment.temperature 
        ? `${Math.round(equipment.temperature)}°F` 
        : equipment.energyConsumption 
        ? `${equipment.energyConsumption.toFixed(1)}kW`
        : 'No Data';
      const sensorSprite = createTextSprite(sensorText, false);
      sensorSprite.position.set(0, 4.8, 0);
      sensorSprite.visible = showSensors;
      equipmentGroup.add(sensorSprite);
      sensorSpritesRef.current.set(equipment.id, sensorSprite);
    });

    // Energy flow lines
    const energyFlowGroup = new THREE.Group();
    energyFlowLinesRef.current = energyFlowGroup;
    
    if (showEnergyFlow) {
      facility.energyFlow.forEach((flow) => {
        const fromEquipment = facility.equipment.find(eq => eq.id === flow.from);
        const toEquipment = facility.equipment.find(eq => eq.id === flow.to);
        
        if (fromEquipment && toEquipment) {
          const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(fromEquipment.position.x, fromEquipment.position.y + 2, fromEquipment.position.z),
            new THREE.Vector3(
              (fromEquipment.position.x + toEquipment.position.x) / 2,
              Math.max(fromEquipment.position.y, toEquipment.position.y) + 4,
              (fromEquipment.position.z + toEquipment.position.z) / 2
            ),
            new THREE.Vector3(toEquipment.position.x, toEquipment.position.y + 2, toEquipment.position.z)
          );

          const points = curve.getPoints(50);
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const lineMaterial = new THREE.LineBasicMaterial({ 
            color: flow.efficiency > 0.8 ? 0x00ff00 : flow.efficiency > 0.6 ? 0xffa500 : 0xff0000,
            linewidth: 2
          });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          energyFlowGroup.add(line);
        }
      });
    }
    
    scene.add(energyFlowGroup);

    // Mouse interaction
    const handleMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(equipmentMeshesRef.current.values())
      );

      if (intersects.length > 0) {
        const equipmentId = intersects[0].object.userData.equipmentId;
        if (equipmentId) {
          onEquipmentSelect(equipmentId);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleMouseClick);


    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Enhanced pulsing effects and equipment animations
      const time = Date.now() * 0.003;
      equipmentMeshesRef.current.forEach((mesh, equipmentId) => {
        const equipment = facility.equipment.find(eq => eq.id === equipmentId);
        if (equipment) {
          const material = mesh.material as THREE.MeshPhongMaterial;
          
          // Animate non-working equipment
          if (equipment.status === 'offline' || equipment.status === 'under_maintenance') {
            const pulseIntensity = 0.3 + Math.sin(time * 2) * 0.2;
            material.emissiveIntensity = selectedEquipment === equipmentId ? 0.5 : pulseIntensity;
          }
          
          // Subtle rotation for selected equipment
          if (selectedEquipment === equipmentId && mesh.parent) {
            mesh.parent.rotation.y += 0.01;
          }
          
          // Animate equipment based on type (e.g., fans, pumps)
          if (equipment.type === 'ahu' || equipment.type === 'rtu') {
            // Simulate fan rotation for operational equipment
            if (equipment.status === 'operational' && mesh.parent) {
              const fanComponent = mesh.parent.children.find(child => 
                child.userData && child.userData.isFan
              );
              if (fanComponent) {
                fanComponent.rotation.z += 0.1;
              }
            }
          }
        }
      });
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleMouseClick);
      
      // Dispose sprites and their textures
      labelSpritesRef.current.forEach(sprite => {
        if (sprite.material.map) sprite.material.map.dispose();
        sprite.material.dispose();
      });
      sensorSpritesRef.current.forEach(sprite => {
        if (sprite.material.map) sprite.material.map.dispose();
        sprite.material.dispose();
      });
      
      // Clear orbit controls ref
      (orbitControlsRef as any).current = null;
      controlsRef.current?.dispose();
      
      if (mountRef.current && renderer.domElement.parentNode) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [facility, onEquipmentSelect, showEnergyFlow]);

  // Update selection highlighting
  useEffect(() => {
    equipmentMeshesRef.current.forEach((mesh, equipmentId) => {
      const material = mesh.material as THREE.MeshPhongMaterial;
      material.emissive.setHex(selectedEquipment === equipmentId ? 0x444444 : 0x000000);
    });
  }, [selectedEquipment]);

  // Update energy flow visibility
  useEffect(() => {
    if (energyFlowLinesRef.current) {
      energyFlowLinesRef.current.visible = showEnergyFlow;
    }
  }, [showEnergyFlow]);

  // Update sensor visibility
  useEffect(() => {
    sensorSpritesRef.current.forEach((sprite) => {
      sprite.visible = showSensors;
    });
  }, [showSensors]);

  return <div ref={mountRef} className="w-full h-full" />;
};

// Helper function to create text sprites
const createTextSprite = (text: string, isLarge = true, isAlert = false): THREE.Sprite => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  
  const fontSize = isLarge ? 24 : 16;
  const padding = isLarge ? 10 : 6;
  
  context.font = `${fontSize}px Arial`;
  const metrics = context.measureText(text);
  const textWidth = metrics.width;
  
  canvas.width = textWidth + padding * 2;
  canvas.height = fontSize + padding * 2;
  
  // Clear and redraw with proper font
  context.font = `${fontSize}px Arial`;
  
  // Background color based on alert status
  if (isAlert) {
    context.fillStyle = 'rgba(255, 0, 0, 0.9)'; // Red background for non-working equipment
  } else {
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
  }
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  
  // Scale sprite based on size
  const scale = isLarge ? 2.5 : 1.5;
  sprite.scale.set(scale, scale * 0.4, 1);
  
  return sprite;
};

const getEquipmentColor = (status: string): number => {
  switch (status) {
    case 'operational': return 0x00ff00;
    case 'needs_attention': return 0xffa500;
    case 'under_maintenance': return 0xff0000;
    case 'offline': return 0xff0000; // Changed to red for better visibility
    default: return 0x00ff00;
  }
};
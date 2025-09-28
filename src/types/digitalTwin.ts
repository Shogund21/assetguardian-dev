export interface DigitalTwinEquipment {
  id: string;
  name: string;
  type: string;
  location: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  status: 'operational' | 'needs_attention' | 'under_maintenance' | 'offline';
  healthScore: number; // 0-100
  temperature?: number;
  pressure?: number;
  vibration?: number;
  energyConsumption?: number;
  alerts: DigitalTwinAlert[];
}

export interface DigitalTwinAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface DigitalTwinFacility {
  id: string;
  name: string;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  equipment: DigitalTwinEquipment[];
  energyFlow: EnergyFlowData[];
}

export interface EnergyFlowData {
  from: string;
  to: string;
  flow: number;
  efficiency: number;
  color: string;
}

export interface DigitalTwinViewport {
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  controls: {
    enabled: boolean;
    autoRotate: boolean;
  };
}

export interface SensorVisualization {
  equipmentId: string;
  sensorType: string;
  value: number;
  unit: string;
  normalRange: {
    min: number;
    max: number;
  };
  status: 'normal' | 'warning' | 'critical';
  position: {
    x: number;
    y: number;
    z: number;
  };
}
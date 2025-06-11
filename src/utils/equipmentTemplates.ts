
export interface ReadingTemplate {
  type: string;
  label: string;
  unit: string;
  normalRange?: {
    min: number;
    max: number;
  };
  warningThreshold?: number;
  criticalThreshold?: number;
  description?: string;
}

export interface EquipmentTemplate {
  equipmentType: string;
  readings: ReadingTemplate[];
}

// Industry standard reading templates for different equipment types
export const equipmentTemplates: EquipmentTemplate[] = [
  {
    equipmentType: 'ahu',
    readings: [
      {
        type: 'supply_air_temp',
        label: 'Supply Air Temperature',
        unit: '°F',
        normalRange: { min: 55, max: 65 },
        warningThreshold: 70,
        criticalThreshold: 75,
        description: 'Temperature of air leaving the AHU'
      },
      {
        type: 'return_air_temp',
        label: 'Return Air Temperature',
        unit: '°F',
        normalRange: { min: 70, max: 78 },
        warningThreshold: 80,
        criticalThreshold: 85,
        description: 'Temperature of air returning to the AHU'
      },
      {
        type: 'static_pressure',
        label: 'Static Pressure',
        unit: 'in. W.C.',
        normalRange: { min: 0.5, max: 2.0 },
        warningThreshold: 2.5,
        criticalThreshold: 3.0,
        description: 'Static pressure across the system'
      },
      {
        type: 'filter_pressure_drop',
        label: 'Filter Pressure Drop',
        unit: 'in. W.C.',
        normalRange: { min: 0.1, max: 0.5 },
        warningThreshold: 0.8,
        criticalThreshold: 1.0,
        description: 'Pressure drop across filters'
      },
      {
        type: 'fan_current',
        label: 'Fan Motor Current',
        unit: 'Amps',
        normalRange: { min: 5, max: 15 },
        warningThreshold: 18,
        criticalThreshold: 20,
        description: 'Current draw of fan motor'
      },
      {
        type: 'vibration_level',
        label: 'Vibration Level',
        unit: 'mm/s',
        normalRange: { min: 0, max: 2.8 },
        warningThreshold: 4.5,
        criticalThreshold: 7.1,
        description: 'Fan and motor vibration levels'
      }
    ]
  },
  {
    equipmentType: 'chiller',
    readings: [
      {
        type: 'evaporator_entering_temp',
        label: 'Evaporator Entering Water Temp',
        unit: '°F',
        normalRange: { min: 54, max: 58 },
        warningThreshold: 60,
        criticalThreshold: 65,
        description: 'Temperature of water entering evaporator (Trane RTAC 250)'
      },
      {
        type: 'evaporator_leaving_temp',
        label: 'Evaporator Leaving Water Temp',
        unit: '°F',
        normalRange: { min: 42, max: 48 },
        warningThreshold: 50,
        criticalThreshold: 55,
        description: 'Temperature of water leaving evaporator (Trane RTAC 250)'
      },
      {
        type: 'condenser_entering_temp',
        label: 'Condenser Entering Air Temp',
        unit: '°F',
        normalRange: { min: 75, max: 85 },
        warningThreshold: 90,
        criticalThreshold: 95,
        description: 'Ambient air temperature entering condenser (Trane RTAC 250)'
      },
      {
        type: 'compressor_1_current',
        label: 'Compressor 1 Current',
        unit: 'Amps',
        normalRange: { min: 45, max: 145 },
        warningThreshold: 160,
        criticalThreshold: 175,
        description: 'Current draw of compressor 1 motor (Trane RTAC 250)'
      },
      {
        type: 'compressor_2_current',
        label: 'Compressor 2 Current',
        unit: 'Amps',
        normalRange: { min: 45, max: 145 },
        warningThreshold: 160,
        criticalThreshold: 175,
        description: 'Current draw of compressor 2 motor (Trane RTAC 250)'
      },
      {
        type: 'suction_pressure',
        label: 'Suction Pressure',
        unit: 'PSIG',
        normalRange: { min: 38, max: 45 },
        warningThreshold: 35,
        criticalThreshold: 30,
        description: 'Refrigerant suction pressure (Trane RTAC 250)'
      },
      {
        type: 'discharge_pressure',
        label: 'Discharge Pressure',
        unit: 'PSIG',
        normalRange: { min: 180, max: 220 },
        warningThreshold: 240,
        criticalThreshold: 260,
        description: 'Refrigerant discharge pressure (Trane RTAC 250)'
      },
      {
        type: 'oil_pressure_1',
        label: 'Oil Pressure 1',
        unit: 'PSIG',
        normalRange: { min: 45, max: 65 },
        warningThreshold: 40,
        criticalThreshold: 35,
        description: 'Compressor 1 oil pressure (Trane RTAC 250)'
      },
      {
        type: 'oil_pressure_2',
        label: 'Oil Pressure 2',
        unit: 'PSIG',
        normalRange: { min: 45, max: 65 },
        warningThreshold: 40,
        criticalThreshold: 35,
        description: 'Compressor 2 oil pressure (Trane RTAC 250)'
      },
      {
        type: 'approach_temperature',
        label: 'Approach Temperature',
        unit: '°F',
        normalRange: { min: 6, max: 10 },
        warningThreshold: 12,
        criticalThreshold: 15,
        description: 'Condenser approach temperature (Trane RTAC 250)'
      },
      {
        type: 'vfd_frequency',
        label: 'VFD Frequency',
        unit: 'Hz',
        normalRange: { min: 30, max: 60 },
        warningThreshold: 65,
        criticalThreshold: 70,
        description: 'Variable frequency drive operating frequency (Trane RTAC 250)'
      }
    ]
  },
  {
    equipmentType: 'cooling_tower',
    readings: [
      {
        type: 'water_temp_in',
        label: 'Water Temperature In',
        unit: '°F',
        normalRange: { min: 85, max: 95 },
        warningThreshold: 100,
        criticalThreshold: 105,
        description: 'Temperature of water entering tower'
      },
      {
        type: 'water_temp_out',
        label: 'Water Temperature Out',
        unit: '°F',
        normalRange: { min: 75, max: 85 },
        warningThreshold: 90,
        criticalThreshold: 95,
        description: 'Temperature of water leaving tower'
      },
      {
        type: 'fan_current',
        label: 'Fan Motor Current',
        unit: 'Amps',
        normalRange: { min: 8, max: 25 },
        warningThreshold: 30,
        criticalThreshold: 35,
        description: 'Current draw of cooling tower fan'
      },
      {
        type: 'vibration_level',
        label: 'Fan Vibration',
        unit: 'mm/s',
        normalRange: { min: 0, max: 2.8 },
        warningThreshold: 4.5,
        criticalThreshold: 7.1,
        description: 'Cooling tower fan vibration'
      },
      {
        type: 'water_flow_rate',
        label: 'Water Flow Rate',
        unit: 'GPM',
        normalRange: { min: 500, max: 1500 },
        warningThreshold: 400,
        criticalThreshold: 300,
        description: 'Water circulation flow rate'
      }
    ]
  },
  {
    equipmentType: 'rtu',
    readings: [
      {
        type: 'supply_air_temp',
        label: 'Supply Air Temperature',
        unit: '°F',
        normalRange: { min: 55, max: 65 },
        warningThreshold: 70,
        criticalThreshold: 75,
        description: 'Temperature of air leaving RTU'
      },
      {
        type: 'return_air_temp',
        label: 'Return Air Temperature',
        unit: '°F',
        normalRange: { min: 70, max: 78 },
        warningThreshold: 80,
        criticalThreshold: 85,
        description: 'Temperature of air returning to RTU'
      },
      {
        type: 'refrigerant_pressure_suction',
        label: 'Suction Pressure',
        unit: 'PSIG',
        normalRange: { min: 60, max: 80 },
        warningThreshold: 55,
        criticalThreshold: 50,
        description: 'Refrigerant suction pressure'
      },
      {
        type: 'refrigerant_pressure_discharge',
        label: 'Discharge Pressure',
        unit: 'PSIG',
        normalRange: { min: 200, max: 300 },
        warningThreshold: 350,
        criticalThreshold: 400,
        description: 'Refrigerant discharge pressure'
      },
      {
        type: 'compressor_current',
        label: 'Compressor Current',
        unit: 'Amps',
        normalRange: { min: 15, max: 45 },
        warningThreshold: 50,
        criticalThreshold: 55,
        description: 'Current draw of compressor'
      },
      {
        type: 'fan_current',
        label: 'Supply Fan Current',
        unit: 'Amps',
        normalRange: { min: 3, max: 12 },
        warningThreshold: 15,
        criticalThreshold: 18,
        description: 'Current draw of supply fan motor'
      }
    ]
  }
];

export const getEquipmentReadingTemplate = (equipmentType: string): ReadingTemplate[] => {
  const template = equipmentTemplates.find(t => t.equipmentType === equipmentType);
  return template?.readings || [];
};

export const getReadingStandards = (equipmentType: string, readingType: string) => {
  const template = getEquipmentReadingTemplate(equipmentType);
  return template.find(r => r.type === readingType);
};

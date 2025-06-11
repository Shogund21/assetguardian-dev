
import { TieredMaintenanceConfig, MaintenanceTemplate } from "@/types/maintenanceFrequency";

// Chiller maintenance templates by frequency
export const chillerMaintenanceTemplates: TieredMaintenanceConfig = {
  daily: {
    frequency: 'daily',
    equipmentType: 'chiller',
    requiredFields: [
      'evaporator_entering_temp',
      'evaporator_leaving_temp', 
      'compressor_current',
      'visual_inspection_status'
    ],
    optionalFields: ['notes'],
    estimatedTime: 5,
    description: 'Quick daily operational check - 5 minute assessment'
  },
  weekly: {
    frequency: 'weekly',
    equipmentType: 'chiller',
    requiredFields: [
      'evaporator_entering_temp',
      'evaporator_leaving_temp',
      'condenser_entering_temp', 
      'compressor_current',
      'suction_pressure',
      'discharge_pressure',
      'oil_pressure',
      'visual_inspection_status'
    ],
    optionalFields: ['refrigerant_level', 'belt_condition', 'notes'],
    estimatedTime: 15,
    description: 'Comprehensive weekly inspection with full readings'
  },
  monthly: {
    frequency: 'monthly',
    equipmentType: 'chiller',
    requiredFields: [
      'evaporator_entering_temp',
      'evaporator_leaving_temp',
      'condenser_entering_temp',
      'condenser_leaving_temp',
      'compressor_current',
      'suction_pressure', 
      'discharge_pressure',
      'oil_pressure',
      'refrigerant_level',
      'belt_condition',
      'condenser_condition',
      'visual_inspection_status',
      'vibration_check',
      'electrical_connections'
    ],
    optionalFields: ['maintenance_recommendations', 'corrective_actions'],
    estimatedTime: 30,
    description: 'Full monthly maintenance inspection and documentation'
  }
};

// AHU maintenance templates by frequency
export const ahuMaintenanceTemplates: TieredMaintenanceConfig = {
  daily: {
    frequency: 'daily',
    equipmentType: 'ahu',
    requiredFields: [
      'supply_air_temp',
      'return_air_temp',
      'fan_motor_current',
      'visual_inspection_status'
    ],
    optionalFields: ['notes'],
    estimatedTime: 3,
    description: 'Quick daily operational check'
  },
  weekly: {
    frequency: 'weekly', 
    equipmentType: 'ahu',
    requiredFields: [
      'supply_air_temp',
      'return_air_temp',
      'static_pressure',
      'filter_pressure_drop',
      'fan_motor_current',
      'fan_belt_condition',
      'visual_inspection_status'
    ],
    optionalFields: ['airflow_reading', 'notes'],
    estimatedTime: 12,
    description: 'Weekly inspection with pressure and belt checks'
  },
  monthly: {
    frequency: 'monthly',
    equipmentType: 'ahu',
    requiredFields: [
      'supply_air_temp',
      'return_air_temp', 
      'static_pressure',
      'filter_pressure_drop',
      'fan_motor_current',
      'fan_belt_condition',
      'fan_bearings_lubricated',
      'dampers_operation',
      'coils_condition',
      'drain_pan_status',
      'visual_inspection_status'
    ],
    optionalFields: ['airflow_reading', 'maintenance_recommendations', 'corrective_actions'],
    estimatedTime: 25,
    description: 'Full monthly maintenance with all systems check'
  }
};

export const getMaintenanceTemplate = (equipmentType: string, frequency: string): MaintenanceTemplate | null => {
  const templates = equipmentType === 'chiller' ? chillerMaintenanceTemplates : 
                   equipmentType === 'ahu' ? ahuMaintenanceTemplates : null;
  
  if (!templates) return null;
  
  return templates[frequency as keyof TieredMaintenanceConfig] || null;
};

export const getAllFrequenciesForEquipment = (equipmentType: string): string[] => {
  const templates = equipmentType === 'chiller' ? chillerMaintenanceTemplates :
                   equipmentType === 'ahu' ? ahuMaintenanceTemplates : null;
  
  if (!templates) return ['daily'];
  
  return Object.keys(templates);
};

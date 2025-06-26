
export interface ReadingTemplate {
  type: string;
  label: string;
  unit: string;
  dataType?: 'numeric' | 'text' | 'boolean';
  normalRange?: {
    min: number;
    max: number;
  };
  warningThreshold?: number;
  criticalThreshold?: number;
  description?: string;
  section?: string;
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
        dataType: 'numeric',
        normalRange: { min: 55, max: 65 },
        warningThreshold: 70,
        criticalThreshold: 75,
        description: 'Temperature of air leaving the AHU'
      },
      {
        type: 'return_air_temp',
        label: 'Return Air Temperature',
        unit: '°F',
        dataType: 'numeric',
        normalRange: { min: 70, max: 78 },
        warningThreshold: 80,
        criticalThreshold: 85,
        description: 'Temperature of air returning to the AHU'
      },
      {
        type: 'static_pressure',
        label: 'Static Pressure',
        unit: 'in. W.C.',
        dataType: 'numeric',
        normalRange: { min: 0.5, max: 2.0 },
        warningThreshold: 2.5,
        criticalThreshold: 3.0,
        description: 'Static pressure across the system'
      },
      {
        type: 'filter_pressure_drop',
        label: 'Filter Pressure Drop',
        unit: 'in. W.C.',
        dataType: 'numeric',
        normalRange: { min: 0.1, max: 0.5 },
        warningThreshold: 0.8,
        criticalThreshold: 1.0,
        description: 'Pressure drop across filters'
      },
      {
        type: 'fan_current',
        label: 'Fan Motor Current',
        unit: 'Amps',
        dataType: 'numeric',
        normalRange: { min: 5, max: 15 },
        warningThreshold: 18,
        criticalThreshold: 20,
        description: 'Current draw of fan motor'
      },
      {
        type: 'vibration_level',
        label: 'Vibration Level',
        unit: 'mm/s',
        dataType: 'numeric',
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
      // Evaporator Section
      {
        type: 'evaporator_leaving_water_temp',
        label: 'Evaporator Leaving Water Temperature',
        unit: '°F',
        dataType: 'numeric',
        section: 'Evaporator',
        normalRange: { min: 42, max: 48 },
        warningThreshold: 50,
        criticalThreshold: 55,
        description: 'Temperature of chilled water leaving evaporator'
      },
      {
        type: 'evaporator_entering_water_temp',
        label: 'Evaporator Entering Water Temperature',
        unit: '°F',
        dataType: 'numeric',
        section: 'Evaporator',
        normalRange: { min: 54, max: 58 },
        warningThreshold: 60,
        criticalThreshold: 65,
        description: 'Temperature of water entering evaporator'
      },
      {
        type: 'evap_sat_rfgt_temp',
        label: 'Evap Sat Rfgt Temp',
        unit: '°F',
        dataType: 'numeric',
        section: 'Evaporator',
        normalRange: { min: 40, max: 45 },
        description: 'Evaporator saturated refrigerant temperature'
      },
      {
        type: 'evap_rfgt_pressure',
        label: 'Evap Rfgt Pressure',
        unit: 'PSIG',
        dataType: 'numeric',
        section: 'Evaporator',
        normalRange: { min: -10, max: -5 },
        description: 'Evaporator refrigerant pressure'
      },
      {
        type: 'evap_approach_temp',
        label: 'Evap Approach Temp',
        unit: '°F',
        dataType: 'numeric',
        section: 'Evaporator',
        normalRange: { min: 1, max: 3 },
        description: 'Evaporator approach temperature'
      },
      {
        type: 'active_chilled_water_setpoint',
        label: 'Active Chilled Water Setpoint',
        unit: '°F',
        dataType: 'numeric',
        section: 'Evaporator',
        normalRange: { min: 44, max: 46 },
        description: 'Current chilled water temperature setpoint'
      },
      {
        type: 'evaporator_pump_override',
        label: 'Evaporator Pump Override',
        unit: 'Status',
        dataType: 'text',
        section: 'Evaporator',
        description: 'Evaporator pump override status (Auto/Manual/Off)'
      },
      {
        type: 'evap_water_flow_status',
        label: 'Evap Water Flow Status',
        unit: 'Status',
        dataType: 'text',
        section: 'Evaporator',
        description: 'Evaporator water flow status (Flow/No Flow/Low Flow)'
      },

      // Condenser Section
      {
        type: 'condenser_entering_water_temp',
        label: 'Cond Entering Water Temp',
        unit: '°F',
        dataType: 'numeric',
        section: 'Condenser',
        normalRange: { min: 75, max: 85 },
        warningThreshold: 90,
        criticalThreshold: 95,
        description: 'Temperature of water entering condenser'
      },
      {
        type: 'condenser_leaving_water_temp',
        label: 'Cond Leaving Water Temp',
        unit: '°F',
        dataType: 'numeric',
        section: 'Condenser',
        normalRange: { min: 80, max: 90 },
        warningThreshold: 95,
        criticalThreshold: 100,
        description: 'Temperature of water leaving condenser'
      },
      {
        type: 'cond_sat_rfgt_temp',
        label: 'Cond Sat Rfgt Temp',
        unit: '°F',
        dataType: 'numeric',
        section: 'Condenser',
        normalRange: { min: 80, max: 90 },
        description: 'Condenser saturated refrigerant temperature'
      },
      {
        type: 'cond_rfgt_pressure',
        label: 'Cond Rfgt Pressure',
        unit: 'PSIG',
        dataType: 'numeric',
        section: 'Condenser',
        normalRange: { min: 0, max: 5 },
        description: 'Condenser refrigerant pressure'
      },
      {
        type: 'cond_approach_temp',
        label: 'Cond Approach Temp',
        unit: '°F',
        dataType: 'numeric',
        section: 'Condenser',
        normalRange: { min: 0, max: 2 },
        description: 'Condenser approach temperature'
      },
      {
        type: 'differential_refrigerant_pressure',
        label: 'Differential Refrigerant Pressure',
        unit: 'PSID',
        dataType: 'numeric',
        section: 'Condenser',
        normalRange: { min: 8, max: 12 },
        description: 'Differential refrigerant pressure across system'
      },
      {
        type: 'condenser_pump_override',
        label: 'Condenser Pump Override',
        unit: 'Status',
        dataType: 'text',
        section: 'Condenser',
        description: 'Condenser pump override status (Auto/Manual/Off)'
      },
      {
        type: 'cond_water_flow_status',
        label: 'Cond Water Flow Status',
        unit: 'Status',
        dataType: 'text',
        section: 'Condenser',
        description: 'Condenser water flow status (Flow/No Flow/Low Flow)'
      },

      // Compressor Section
      {
        type: 'compressor_running_status',
        label: 'Compressor Running',
        unit: 'Status',
        dataType: 'text',
        section: 'Compressor',
        description: 'Compressor running status (Running/Stopped/Starting)'
      },
      {
        type: 'chiller_control_signal',
        label: 'Chiller Control Signal',
        unit: '%',
        dataType: 'numeric',
        section: 'Compressor',
        normalRange: { min: 30, max: 80 },
        description: 'Chiller control signal percentage'
      },
      {
        type: 'average_motor_current_pct_rla',
        label: 'Average Motor Current % RLA',
        unit: '%',
        dataType: 'numeric',
        section: 'Compressor',
        normalRange: { min: 50, max: 85 },
        warningThreshold: 90,
        criticalThreshold: 95,
        description: 'Average motor current as percentage of rated load amperage'
      },
      {
        type: 'compressor_starts',
        label: 'Compressor Starts',
        unit: 'Count',
        dataType: 'numeric',
        section: 'Compressor',
        description: 'Total number of compressor starts'
      },
      {
        type: 'oil_differential_pressure',
        label: 'Oil Differential Pressure',
        unit: 'PSID',
        dataType: 'numeric',
        section: 'Compressor',
        normalRange: { min: 20, max: 30 },
        warningThreshold: 15,
        criticalThreshold: 10,
        description: 'Oil differential pressure across compressor'
      },
      {
        type: 'compressor_running_time',
        label: 'Compressor Running Time',
        unit: 'Hr:Min',
        dataType: 'text',
        section: 'Compressor',
        description: 'Total compressor running time in hours and minutes'
      },
      {
        type: 'oil_pump_discharge_pressure',
        label: 'Oil Pump Discharge Pressure',
        unit: 'PSIG',
        dataType: 'numeric',
        section: 'Compressor',
        normalRange: { min: 15, max: 25 },
        description: 'Oil pump discharge pressure'
      },
      {
        type: 'oil_tank_pressure',
        label: 'Oil Tank Pressure',
        unit: 'PSIG',
        dataType: 'numeric',
        section: 'Compressor',
        normalRange: { min: -10, max: -5 },
        description: 'Oil tank pressure reading'
      },
      {
        type: 'compressor_refrigerant_discharge_temp',
        label: 'Compressor Refrigerant Discharge Temperature',
        unit: '°F',
        dataType: 'numeric',
        section: 'Compressor',
        normalRange: { min: 100, max: 120 },
        warningThreshold: 130,
        criticalThreshold: 140,
        description: 'Compressor refrigerant discharge temperature'
      },
      {
        type: 'oil_pump_control',
        label: 'Oil Pump Control',
        unit: 'Status',
        dataType: 'text',
        section: 'Compressor',
        description: 'Oil pump control status (Auto/Manual/Off)'
      },
      {
        type: 'oil_pump_command',
        label: 'Oil Pump Command',
        unit: 'Status',
        dataType: 'text',
        section: 'Compressor',
        description: 'Oil pump command status (On/Off)'
      },

      // Motor Section
      {
        type: 'active_current_limit_setpoint',
        label: 'Active Current Limit Setpoint',
        unit: '%',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 75, max: 85 },
        description: 'Active current limit setpoint percentage'
      },
      {
        type: 'average_motor_current_pct_rla_motor',
        label: 'Average Motor Current % RLA',
        unit: '%',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 50, max: 85 },
        warningThreshold: 90,
        criticalThreshold: 95,
        description: 'Motor average current as percentage of rated load amperage'
      },
      {
        type: 'motor_frequency',
        label: 'Motor Frequency',
        unit: 'Hz',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 58, max: 62 },
        description: 'Motor operating frequency'
      },
      {
        type: 'starter_motor_current_l1_pct_rla',
        label: 'Starter Motor Current L1 % RLA',
        unit: '%',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 50, max: 85 },
        description: 'Line 1 starter motor current percentage of RLA'
      },
      {
        type: 'starter_motor_current_l2_pct_rla',
        label: 'Starter Motor Current L2 % RLA',
        unit: '%',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 50, max: 85 },
        description: 'Line 2 starter motor current percentage of RLA'
      },
      {
        type: 'starter_motor_current_l3_pct_rla',
        label: 'Starter Motor Current L3 % RLA',
        unit: '%',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 50, max: 85 },
        description: 'Line 3 starter motor current percentage of RLA'
      },
      {
        type: 'starter_motor_current_l1',
        label: 'Starter Motor Current L1',
        unit: 'Amps',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 100, max: 150 },
        description: 'Line 1 starter motor current in amperes'
      },
      {
        type: 'starter_motor_current_l2',
        label: 'Starter Motor Current L2',
        unit: 'Amps',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 100, max: 150 },
        description: 'Line 2 starter motor current in amperes'
      },
      {
        type: 'starter_motor_current_l3',
        label: 'Starter Motor Current L3',
        unit: 'Amps',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 100, max: 150 },
        description: 'Line 3 starter motor current in amperes'
      },
      {
        type: 'afd_input_current_l1',
        label: 'AFD Input Current L1',
        unit: 'Amps',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 100, max: 130 },
        description: 'AFD Line 1 input current in amperes'
      },
      {
        type: 'afd_input_current_l2',
        label: 'AFD Input Current L2',
        unit: 'Amps',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 100, max: 130 },
        description: 'AFD Line 2 input current in amperes'
      },
      {
        type: 'afd_input_current_l3',
        label: 'AFD Input Current L3',
        unit: 'Amps',
        dataType: 'numeric',
        section: 'Motor',
        normalRange: { min: 100, max: 130 },
        description: 'AFD Line 3 input current in amperes'
      },

      // General Legacy Readings (for backward compatibility)
      {
        type: 'suction_pressure',
        label: 'Suction Pressure',
        unit: 'PSIG',
        dataType: 'numeric',
        normalRange: { min: 38, max: 45 },
        warningThreshold: 35,
        criticalThreshold: 30,
        description: 'Refrigerant suction pressure'
      },
      {
        type: 'discharge_pressure',
        label: 'Discharge Pressure',
        unit: 'PSIG',
        dataType: 'numeric',
        normalRange: { min: 180, max: 220 },
        warningThreshold: 240,
        criticalThreshold: 260,
        description: 'Refrigerant discharge pressure'
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
        dataType: 'numeric',
        normalRange: { min: 85, max: 95 },
        warningThreshold: 100,
        criticalThreshold: 105,
        description: 'Temperature of water entering tower'
      },
      {
        type: 'water_temp_out',
        label: 'Water Temperature Out',
        unit: '°F',
        dataType: 'numeric',
        normalRange: { min: 75, max: 85 },
        warningThreshold: 90,
        criticalThreshold: 95,
        description: 'Temperature of water leaving tower'
      },
      {
        type: 'fan_current',
        label: 'Fan Motor Current',
        unit: 'Amps',
        dataType: 'numeric',
        normalRange: { min: 8, max: 25 },
        warningThreshold: 30,
        criticalThreshold: 35,
        description: 'Current draw of cooling tower fan'
      },
      {
        type: 'vibration_level',
        label: 'Fan Vibration',
        unit: 'mm/s',
        dataType: 'numeric',
        normalRange: { min: 0, max: 2.8 },
        warningThreshold: 4.5,
        criticalThreshold: 7.1,
        description: 'Cooling tower fan vibration'
      },
      {
        type: 'water_flow_rate',
        label: 'Water Flow Rate',
        unit: 'GPM',
        dataType: 'numeric',
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
        dataType: 'numeric',
        normalRange: { min: 55, max: 65 },
        warningThreshold: 70,
        criticalThreshold: 75,
        description: 'Temperature of air leaving RTU'
      },
      {
        type: 'return_air_temp',
        label: 'Return Air Temperature',
        unit: '°F',
        dataType: 'numeric',
        normalRange: { min: 70, max: 78 },
        warningThreshold: 80,
        criticalThreshold: 85,
        description: 'Temperature of air returning to RTU'
      },
      {
        type: 'refrigerant_pressure_suction',
        label: 'Suction Pressure',
        unit: 'PSIG',
        dataType: 'numeric',
        normalRange: { min: 60, max: 80 },
        warningThreshold: 55,
        criticalThreshold: 50,
        description: 'Refrigerant suction pressure'
      },
      {
        type: 'refrigerant_pressure_discharge',
        label: 'Discharge Pressure',
        unit: 'PSIG',
        dataType: 'numeric',
        normalRange: { min: 200, max: 300 },
        warningThreshold: 350,
        criticalThreshold: 400,
        description: 'Refrigerant discharge pressure'
      },
      {
        type: 'compressor_current',
        label: 'Compressor Current',
        unit: 'Amps',
        dataType: 'numeric',
        normalRange: { min: 15, max: 45 },
        warningThreshold: 50,
        criticalThreshold: 55,
        description: 'Current draw of compressor'
      },
      {
        type: 'fan_current',
        label: 'Supply Fan Current',
        unit: 'Amps',
        dataType: 'numeric',
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

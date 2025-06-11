
import { z } from "zod";

export const maintenanceFormSchema = z.object({
  location_id: z.string().min(1, "Location is required"),
  equipment_id: z.string().min(1, "Equipment is required"), 
  technician_id: z.string().min(1, "Technician is required"),
  maintenance_frequency: z.string().optional().default("daily"),
  
  notes: z.string().optional(),
  
  // Standard HVAC fields
  chiller_pressure_reading: z.string().optional(),
  chiller_temperature_reading: z.string().optional(),
  air_filter_status: z.string().optional(),
  belt_condition: z.string().optional(),
  refrigerant_level: z.string().optional(),
  unusual_noise: z.boolean().optional(),
  vibration_observed: z.boolean().optional(),
  oil_level_status: z.string().optional(),
  condenser_condition: z.string().optional(),
  
  // AHU specific fields
  air_filter_cleaned: z.boolean().optional(),
  fan_belt_condition: z.string().optional(),
  fan_bearings_lubricated: z.boolean().optional(),
  fan_noise_level: z.string().optional(),
  dampers_operation: z.string().optional(),
  coils_condition: z.string().optional(),
  sensors_operation: z.string().optional(),
  motor_condition: z.string().optional(),
  drain_pan_status: z.string().optional(),
  airflow_reading: z.string().optional(),
  airflow_unit: z.string().optional(),
  troubleshooting_notes: z.string().optional(),
  corrective_actions: z.string().optional(),
  maintenance_recommendations: z.string().optional(),
  
  // Elevator fields
  elevator_operation: z.string().optional(),
  door_operation: z.string().optional(),
  unusual_noise_elevator: z.boolean().optional(),
  vibration_elevator: z.boolean().optional(),
  emergency_phone: z.string().optional(),
  elevator_lighting: z.string().optional(),
  elevator_notes: z.string().optional(),
  
  // Restroom fields
  sink_status: z.string().optional(),
  toilet_status: z.string().optional(),
  urinal_status: z.string().optional(),
  hand_dryer_status: z.string().optional(),
  cleanliness_level: z.string().optional(),
  soap_supply: z.string().optional(),
  toilet_paper_supply: z.string().optional(),
  floor_condition: z.string().optional(),
  restroom_notes: z.string().optional(),
  
  // RTU specific fields
  heat_exchanger_condition: z.string().optional(),
  gas_pressure_reading: z.string().optional(),
  ignition_system_status: z.string().optional(),
  heat_strip_status: z.string().optional(),
  flue_gas_temperature: z.string().optional(),
  high_side_pressure: z.string().optional(),
  low_side_pressure: z.string().optional(),
  compressor_operation_status: z.string().optional(),
  condenser_coil_condition: z.string().optional(),
  evaporator_coil_condition: z.string().optional(),
  expansion_valve_operation: z.string().optional(),
  supply_air_temperature: z.string().optional(),
  return_air_temperature: z.string().optional(),
  static_pressure_reading: z.string().optional(),
  filter_pressure_drop: z.string().optional(),
  ductwork_condition: z.string().optional(),
  thermostat_calibration: z.string().optional(),
  control_sequence_verified: z.boolean().optional(),
  safety_circuit_operation: z.string().optional(),
  economizer_operation: z.string().optional(),
  fan_motor_amp_draw: z.string().optional(),
  blower_wheel_condition: z.string().optional(),
  belt_tension_status: z.string().optional(),
  bearing_lubrication_status: z.string().optional(),
  rtu_notes: z.string().optional(),
  
  // Trane RTAC specific fields
  compressor_1_current: z.string().optional(),
  compressor_2_current: z.string().optional(),
  oil_pressure_1: z.string().optional(),
  oil_pressure_2: z.string().optional(),
  approach_temperature: z.string().optional(),
  vfd_frequency: z.string().optional(),
  staging_status: z.string().optional(),
  control_mode: z.string().optional(),
  
  // New tiered maintenance fields
  evaporator_entering_temp: z.string().optional(),
  evaporator_leaving_temp: z.string().optional(),
  condenser_entering_temp: z.string().optional(),
  condenser_leaving_temp: z.string().optional(),
  compressor_current: z.string().optional(),
  suction_pressure: z.string().optional(),
  discharge_pressure: z.string().optional(),
  oil_pressure: z.string().optional(),
  visual_inspection_status: z.string().optional(),
  supply_air_temp: z.string().optional(),
  return_air_temp: z.string().optional(),
  static_pressure: z.string().optional(),
  fan_motor_current: z.string().optional(),
  
  // Internal tracking
  selected_location: z.string().optional(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

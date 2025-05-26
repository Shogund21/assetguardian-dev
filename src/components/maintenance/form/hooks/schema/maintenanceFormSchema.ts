
import * as z from "zod";

/**
 * String field that can also be "NA"
 */
export const naString = z.union([z.string(), z.literal("NA")]);

/**
 * Zod schema for maintenance form validation
 */
export const maintenanceFormSchema = z.object({
  selected_location: z.string().optional(),
  location_id: z.string().optional(),
  equipment_id: z.string().min(1, "Equipment is required"),
  technician_id: z.string().min(1, "Technician is required"),
  equipment_type: z.string().optional(),
  
  // Standard HVAC fields
  chiller_pressure_reading: naString.optional(),
  chiller_temperature_reading: naString.optional(),
  air_filter_status: naString.optional(),
  belt_condition: naString.optional(),
  refrigerant_level: naString.optional(),
  unusual_noise: z.boolean().default(false),
  unusual_noise_description: z.string().optional(),
  vibration_observed: z.boolean().default(false),
  vibration_description: z.string().optional(),
  oil_level_status: naString.optional(),
  condenser_condition: naString.optional(),
  notes: z.string().optional().nullable(),
  
  // AHU specific fields
  air_filter_cleaned: z.boolean().optional(),
  fan_belt_condition: naString.optional(),
  fan_bearings_lubricated: z.boolean().optional(),
  fan_noise_level: naString.optional(),
  dampers_operation: naString.optional(),
  coils_condition: naString.optional(),
  sensors_operation: naString.optional(),
  motor_condition: naString.optional(),
  drain_pan_status: naString.optional(),
  airflow_reading: naString.optional(),
  airflow_unit: z.string().optional(),
  
  // Enhanced Chiller fields
  condenser_pressure_reading: z.string().optional(),
  evaporator_pressure_reading: z.string().optional(),
  superheat_reading: z.string().optional(),
  subcooling_reading: z.string().optional(),
  compressor_amp_draw: z.string().optional(),
  voltage_reading: z.string().optional(),
  power_factor: z.string().optional(),
  control_panel_status: naString.optional(),
  chilled_water_flow_rate: z.string().optional(),
  condenser_water_flow_rate: z.string().optional(),
  water_quality_status: naString.optional(),
  strainer_condition: naString.optional(),
  water_treatment_levels: naString.optional(),
  compressor_vibration_level: naString.optional(),
  bearing_temperature: z.string().optional(),
  coupling_alignment_status: naString.optional(),
  safety_switches_operation: naString.optional(),
  alarm_system_status: naString.optional(),
  sensor_calibration_status: naString.optional(),
  emergency_shutdown_tested: z.boolean().optional(),
  chiller_notes: z.string().optional().nullable(),
  
  // RTU specific fields
  heat_exchanger_condition: naString.optional(),
  gas_pressure_reading: z.string().optional(),
  ignition_system_status: naString.optional(),
  heat_strip_status: naString.optional(),
  flue_gas_temperature: z.string().optional(),
  high_side_pressure: z.string().optional(),
  low_side_pressure: z.string().optional(),
  compressor_operation_status: naString.optional(),
  condenser_coil_condition: naString.optional(),
  evaporator_coil_condition: naString.optional(),
  expansion_valve_operation: naString.optional(),
  supply_air_temperature: z.string().optional(),
  return_air_temperature: z.string().optional(),
  static_pressure_reading: z.string().optional(),
  filter_pressure_drop: z.string().optional(),
  ductwork_condition: naString.optional(),
  thermostat_calibration: naString.optional(),
  control_sequence_verified: z.boolean().optional(),
  safety_circuit_operation: naString.optional(),
  economizer_operation: naString.optional(),
  fan_motor_amp_draw: z.string().optional(),
  blower_wheel_condition: naString.optional(),
  belt_tension_status: naString.optional(),
  bearing_lubrication_status: naString.optional(),
  rtu_notes: z.string().optional().nullable(),
  
  // Elevator fields
  elevator_operation: z.string().optional(),
  door_operation: z.string().optional(),
  unusual_noise_elevator: z.boolean().optional(),
  vibration_elevator: z.boolean().optional(),
  emergency_phone: z.string().optional(),
  elevator_lighting: z.string().optional(),
  elevator_notes: z.string().optional().nullable(),
  
  // Restroom fields
  sink_status: z.string().optional(),
  toilet_status: z.string().optional(),
  urinal_status: z.string().optional(),
  hand_dryer_status: z.string().optional(),
  cleanliness_level: z.string().optional(),
  soap_supply: z.string().optional(),
  toilet_paper_supply: z.string().optional(),
  floor_condition: z.string().optional(),
  restroom_notes: z.string().optional().nullable(),
  
  // Common fields
  troubleshooting_notes: z.string().optional().nullable(),
  corrective_actions: z.string().optional().nullable(),
  maintenance_recommendations: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
});

/**
 * Type definition for form values inferred from schema
 */
export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

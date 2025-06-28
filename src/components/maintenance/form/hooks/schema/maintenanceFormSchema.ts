
import { z } from "zod";

export const maintenanceFormSchema = z.object({
  // Basic form fields
  location_id: z.string().min(1, "Location is required"),
  equipment_id: z.string().min(1, "Equipment is required"),
  technician_id: z.string().min(1, "Technician is required"),
  notes: z.string().optional(),
  reading_mode: z.enum(["standard", "manual", "ai_image"]).optional(),
  
  // AI Image specific fields
  ai_extracted_image: z.string().optional(),
  ai_extracted_readings: z.string().optional(),
  
  // Standard HVAC readings
  chiller_pressure_reading: z.string().optional(),
  chiller_temperature_reading: z.string().optional(),
  air_filter_status: z.string().optional(),
  belt_condition: z.string().optional(),
  refrigerant_level: z.string().optional(),
  oil_level_status: z.string().optional(),
  condenser_condition: z.string().optional(),
  
  // Boolean fields
  unusual_noise: z.boolean().optional(),
  vibration_observed: z.boolean().optional(),
  
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
  
  // Additional AHU temperature and pressure fields
  supply_air_temp: z.string().optional(),
  return_air_temp: z.string().optional(),
  static_pressure: z.string().optional(),
  filter_pressure_drop: z.string().optional(),
  fan_motor_current: z.string().optional(),
  visual_inspection_status: z.string().optional(),
  
  // Basic Chiller specific fields
  evaporator_entering_temp: z.string().optional(),
  evaporator_leaving_temp: z.string().optional(),
  condenser_entering_temp: z.string().optional(),
  condenser_leaving_temp: z.string().optional(),
  compressor_current: z.string().optional(),
  suction_pressure: z.string().optional(),
  discharge_pressure: z.string().optional(),
  oil_pressure: z.string().optional(),
  
  // Comprehensive Chiller - Evaporator fields
  evaporator_leaving_water_temp: z.string().optional(),
  evaporator_entering_water_temp: z.string().optional(),
  evap_sat_rfgt_temp: z.string().optional(),
  evap_rfgt_pressure: z.string().optional(),
  evap_approach_temp: z.string().optional(),
  active_chilled_water_setpoint: z.string().optional(),
  evaporator_pump_override: z.string().optional(),
  evap_water_flow_status: z.string().optional(),
  
  // Comprehensive Chiller - Condenser fields
  condenser_entering_water_temp: z.string().optional(),
  condenser_leaving_water_temp: z.string().optional(),
  cond_sat_rfgt_temp: z.string().optional(),
  cond_rfgt_pressure: z.string().optional(),
  cond_approach_temp: z.string().optional(),
  differential_refrigerant_pressure: z.string().optional(),
  condenser_pump_override: z.string().optional(),
  cond_water_flow_status: z.string().optional(),
  
  // Comprehensive Chiller - Compressor fields
  compressor_running_status: z.string().optional(),
  chiller_control_signal: z.string().optional(),
  average_motor_current_pct_rla: z.string().optional(),
  compressor_starts: z.string().optional(),
  oil_differential_pressure: z.string().optional(),
  compressor_running_time: z.string().optional(),
  oil_pump_discharge_pressure: z.string().optional(),
  oil_tank_pressure: z.string().optional(),
  compressor_refrigerant_discharge_temp: z.string().optional(),
  oil_pump_control: z.string().optional(),
  oil_pump_command: z.string().optional(),
  
  // Comprehensive Chiller - Motor fields
  active_current_limit_setpoint: z.string().optional(),
  average_motor_current_pct_rla_motor: z.string().optional(),
  motor_frequency: z.string().optional(),
  starter_motor_current_l1_pct_rla: z.string().optional(),
  starter_motor_current_l2_pct_rla: z.string().optional(),
  starter_motor_current_l3_pct_rla: z.string().optional(),
  starter_motor_current_l1: z.string().optional(),
  starter_motor_current_l2: z.string().optional(),
  starter_motor_current_l3: z.string().optional(),
  afd_input_current_l1: z.string().optional(),
  afd_input_current_l2: z.string().optional(),
  afd_input_current_l3: z.string().optional(),
  
  // Elevator fields
  unusual_noise_elevator: z.boolean().optional(),
  vibration_elevator: z.boolean().optional(),
  elevator_operation: z.string().optional(),
  door_operation: z.string().optional(),
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
  
  // Additional notes
  troubleshooting_notes: z.string().optional(),
  corrective_actions: z.string().optional(),
  maintenance_recommendations: z.string().optional(),
  
  // Manual readings array
  manual_readings: z.array(z.object({
    id: z.string(),
    type: z.string(),
    label: z.string(),
    value: z.string(),
    unit: z.string(),
    notes: z.string(),
  })).optional(),
  
  // Internal tracking
  selected_location: z.string().optional(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

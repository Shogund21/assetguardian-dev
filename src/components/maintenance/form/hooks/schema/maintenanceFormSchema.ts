
import { z } from "zod";

export const maintenanceFormSchema = z.object({
  // Basic form fields
  location_id: z.string().min(1, "Location is required"),
  equipment_id: z.string().min(1, "Equipment is required"),
  technician_id: z.string().min(1, "Technician is required"),
  company_id: z.string().optional(), // Added for RLS policy compliance
  notes: z.string().optional(),
  reading_mode: z.enum(["standard", "manual", "ai_image"]).optional(),
  
  // Maintenance frequency field
  maintenance_frequency: z.string().optional(),
  
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
  
  // Trane RTAC specific fields
  compressor_1_current: z.string().optional(),
  compressor_2_current: z.string().optional(),
  oil_pressure_1: z.string().optional(),
  oil_pressure_2: z.string().optional(),
  approach_temperature: z.string().optional(),
  vfd_frequency: z.string().optional(),
  staging_status: z.string().optional(),
  control_mode: z.string().optional(),
  
  // Comprehensive Chiller - Evaporator fields
  evaporator_leaving_water_temp: z.string().optional(),
  evaporator_entering_water_temp: z.string().optional(),
  evap_sat_rfgt_temp: z.string().optional(),
  evap_rfgt_pressure: z.string().optional(),
  evap_approach_temp: z.string().optional(),
  active_chilled_water_setpoint: z.string().optional(),
  evaporator_pump_override: z.string().optional(),
  evap_water_flow_status: z.string().optional(),
  evaporator_condition: z.string().optional(),
  
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
  
  // RTU specific fields - Heating System
  heat_exchanger_condition: z.string().optional(),
  gas_pressure_reading: z.string().optional(),
  ignition_system_status: z.string().optional(),
  heat_strip_status: z.string().optional(),
  flue_gas_temperature: z.string().optional(),
  
  // RTU specific fields - Cooling System
  high_side_pressure: z.string().optional(),
  low_side_pressure: z.string().optional(),
  compressor_operation_status: z.string().optional(),
  condenser_coil_condition: z.string().optional(),
  evaporator_coil_condition: z.string().optional(),
  expansion_valve_operation: z.string().optional(),
  
  // RTU specific fields - Air System
  supply_air_temperature: z.string().optional(),
  return_air_temperature: z.string().optional(),
  static_pressure_reading: z.string().optional(),
  ductwork_condition: z.string().optional(),
  
  // RTU specific fields - Electrical and Controls
  thermostat_calibration: z.string().optional(),
  control_sequence_verified: z.boolean().optional(),
  safety_circuit_operation: z.string().optional(),
  economizer_operation: z.string().optional(),
  
  // RTU specific fields - Mechanical Components
  fan_motor_amp_draw: z.string().optional(),
  blower_wheel_condition: z.string().optional(),
  belt_tension_status: z.string().optional(),
  bearing_lubrication_status: z.string().optional(),
  
  // RTU notes
  rtu_notes: z.string().optional(),
  
  // Cooling Tower specific fields
  general_inspection: z.string().optional(),
  water_system_status: z.string().optional(),
  fill_media_condition: z.string().optional(),
  drift_eliminators_condition: z.string().optional(),
  fan_assembly_status: z.string().optional(),
  motor_lubrication_status: z.string().optional(),
  pump_seals_condition: z.string().optional(),
  strainer_status: z.string().optional(),
  sump_basin_condition: z.string().optional(),
  drainage_system_status: z.string().optional(),
  control_system_status: z.string().optional(),
  sensor_status: z.string().optional(),
  seasonal_preparation_status: z.string().optional(),
  vibration_monitoring: z.string().optional(),
  emergency_shutdown_status: z.string().optional(),
  safety_features_status: z.string().optional(),
  city_conductivity_us_cm: z.number().optional(),
  tower_conductivity_us_cm: z.number().optional(),
  
  // Environmental readings
  ambient_temperature: z.string().optional(),
  humidity_level: z.string().optional(),
  
  // Electrical and safety fields
  electrical_connections_condition: z.string().optional(),
  control_panel_condition: z.string().optional(),
  safety_switches_status: z.string().optional(),
  
  // Maintenance action fields
  filters_replaced: z.boolean().optional(),
  coils_cleaned: z.boolean().optional(),
  belts_inspected: z.boolean().optional(),
  bearings_lubricated: z.boolean().optional(),
  refrigerant_checked: z.boolean().optional(),
  
  // Performance metrics
  system_efficiency_rating: z.string().optional(),
  energy_consumption_kwh: z.string().optional(),
  operating_hours: z.string().optional(),
  cooling_capacity_tons: z.string().optional(),
  heating_capacity_btuh: z.string().optional(),
  efficiency_cop: z.string().optional(),
  
  // Water treatment fields
  water_ph_level: z.string().optional(),
  water_conductivity: z.string().optional(),
  chemical_treatment_status: z.string().optional(),
  
  // Follow-up and cost fields
  inspection_notes: z.string().optional(),
  follow_up_required: z.boolean().optional(),
  next_inspection_date: z.string().optional(),
  maintenance_duration_minutes: z.string().optional(),
  labor_cost: z.string().optional(),
  parts_cost: z.string().optional(),
  parts_used: z.string().optional(),
  
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


export interface MaintenanceCheck {
  id: string;
  equipment_id: string;
  technician_id: string;
  check_date: string;
  status: "completed" | "pending" | "issue_found";
  notes?: string;
  created_at: string;
  updated_at: string;
  location_id?: string;
  maintenance_frequency?: string;
  reading_mode?: string;
  
  // Equipment relationship
  equipment?: {
    name: string;
    location: string;
    type?: string;
  };
  
  // Technician relationship
  technician?: {
    firstName: string;
    lastName: string;
  };
  
  // Location relationship - this will now properly contain the selected location
  location?: MaintenanceLocation;

  // Standard HVAC fields
  chiller_pressure_reading?: number;
  chiller_temperature_reading?: number;
  air_filter_status?: string;
  belt_condition?: string;
  refrigerant_level?: string;
  unusual_noise?: boolean;
  vibration_observed?: boolean;
  oil_level_status?: string;
  condenser_condition?: string;
  
  // Environmental readings
  ambient_temperature?: number;
  humidity_level?: number;
  
  // Electrical and safety
  electrical_connections_condition?: string;
  control_panel_condition?: string;
  safety_switches_status?: string;
  
  // Maintenance actions
  filters_replaced?: boolean;
  coils_cleaned?: boolean;
  belts_inspected?: boolean;
  bearings_lubricated?: boolean;
  refrigerant_checked?: boolean;
  
  // Performance metrics
  system_efficiency_rating?: number;
  energy_consumption_kwh?: number;
  operating_hours?: number;
  cooling_capacity_tons?: number;
  heating_capacity_btuh?: number;
  efficiency_cop?: number;
  
  // Water treatment
  water_ph_level?: number;
  water_conductivity?: number;
  chemical_treatment_status?: string;
  
  // Comprehensive chiller fields - Evaporator
  evaporator_approach_temp?: number;
  evaporator_leaving_water_temp?: number;
  evaporator_entering_water_temp?: number;
  evaporator_pressure_drop?: number;
  evaporator_flow_rate?: number;
  evaporator_condition?: string;
  
  // Comprehensive chiller fields - Condenser
  condenser_approach_temp?: number;
  condenser_entering_water_temp?: number;
  condenser_leaving_water_temp?: number;
  condenser_pressure_drop?: number;
  condenser_flow_rate?: number;
  
  // Comprehensive chiller fields - Compressor
  compressor_suction_temp?: number;
  compressor_discharge_temp?: number;
  compressor_suction_pressure?: number;
  compressor_discharge_pressure?: number;
  compressor_superheat?: number;
  compressor_subcooling?: number;
  compressor_oil_pressure?: number;
  compressor_oil_temp?: number;
  compressor_condition?: string;
  
  // Comprehensive chiller fields - Motor
  motor_amperage_rla?: number;
  motor_voltage_phase1?: number;
  motor_voltage_phase2?: number;
  motor_voltage_phase3?: number;
  motor_temperature?: number;
  motor_vibration?: number;
  
  // Follow-up and costs
  inspection_notes?: string;
  follow_up_required?: boolean;
  next_inspection_date?: string;
  maintenance_duration_minutes?: number;
  labor_cost?: number;
  parts_cost?: number;
  parts_used?: any;
  
  // AHU specific fields
  air_filter_cleaned?: boolean;
  fan_belt_condition?: string;
  fan_bearings_lubricated?: boolean;
  fan_noise_level?: string;
  dampers_operation?: string;
  coils_condition?: string;
  sensors_operation?: string;
  motor_condition?: string;
  drain_pan_status?: string;
  airflow_reading?: number;
  airflow_unit?: string;
  troubleshooting_notes?: string;
  corrective_actions?: string;
  maintenance_recommendations?: string;
  
  // Cooling tower fields
  city_conductivity_us_cm?: number;
  tower_conductivity_us_cm?: number;
  fill_media_condition?: string;
  drift_eliminators_condition?: string;
  fan_assembly_status?: string;
  motor_lubrication_status?: string;
  pump_seals_condition?: string;
  strainer_status?: string;
  sump_basin_condition?: string;
  water_system_status?: string;
  drainage_system_status?: string;
  control_system_status?: string;
  sensor_status?: string;
  seasonal_preparation_status?: string;
  vibration_monitoring?: string;
  emergency_shutdown_status?: string;
  
  // Elevator fields
  elevator_operation?: string;
  door_operation?: string;
  unusual_noise_elevator?: boolean;
  vibration_elevator?: boolean;
  emergency_phone?: string;
  elevator_lighting?: string;
  elevator_notes?: string;
  
  // Restroom fields
  sink_status?: string;
  toilet_status?: string;
  urinal_status?: string;
  hand_dryer_status?: string;
  cleanliness_level?: string;
  soap_supply?: string;
  toilet_paper_supply?: string;
  floor_condition?: string;
  restroom_notes?: string;
  
  // Additional fields for various equipment types
  [key: string]: any;
}

export interface Equipment {
  id: string;
  name: string;
  location: string;
  type?: string;
  status?: string;
  serialNumber?: string;
  model?: string;
  company_id?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization?: string;
  isAvailable?: boolean;
  company_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceLocation {
  name: string;
  store_number?: string;
}

export interface MaintenanceFormData {
  equipment_id: string;
  technician_id: string;
  location_id?: string;
  maintenance_frequency?: string;
  reading_mode?: string;
  notes?: string;
  
  // All possible maintenance fields
  [key: string]: any;
}

export interface MaintenanceDocument {
  id: string;
  check_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  file_path?: string;
  uploaded_at: string;
  category?: string;
  tags?: string[];
  comments?: string;
  equipment_id?: string;
  maintenance_check_id?: string;
  project_id?: string;
  company_id?: string;
  uploaded_by?: string;
}

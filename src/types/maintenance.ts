
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
  
  // Location relationship
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


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

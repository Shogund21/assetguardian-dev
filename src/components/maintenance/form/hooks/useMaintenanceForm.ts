
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceFormSchema } from "./schema/maintenanceFormSchema";

export interface MaintenanceFormValues {
  location_id: string;
  equipment_id: string;
  technician_id: string;
  notes: string;
  
  // Equipment-specific fields with proper string types
  chiller_pressure_reading?: string;
  chiller_temperature_reading?: string;
  air_filter_status?: string;
  belt_condition?: string;
  refrigerant_level?: string;
  oil_level_status?: string;
  condenser_condition?: string;
  
  // AHU fields
  fan_belt_condition?: string;
  fan_noise_level?: string;
  dampers_operation?: string;
  coils_condition?: string;
  sensors_operation?: string;
  motor_condition?: string;
  drain_pan_status?: string;
  airflow_reading?: string;
  airflow_unit?: string;
  
  // Boolean fields
  unusual_noise?: boolean;
  vibration_observed?: boolean;
  air_filter_cleaned?: boolean;
  fan_bearings_lubricated?: boolean;
  unusual_noise_elevator?: boolean;
  vibration_elevator?: boolean;
  
  // Notes fields
  restroom_notes?: string;
  elevator_notes?: string;
  troubleshooting_notes?: string;
  corrective_actions?: string;
  maintenance_recommendations?: string;
  
  // Internal tracking
  selected_location?: string;
}

export const useMaintenanceForm = () => {
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      location_id: "",
      equipment_id: "",
      technician_id: "",
      notes: "",
      
      // Set proper default values as strings, not objects
      chiller_pressure_reading: "",
      chiller_temperature_reading: "",
      air_filter_status: "",
      belt_condition: "",
      refrigerant_level: "",
      oil_level_status: "",
      condenser_condition: "",
      
      // AHU defaults
      fan_belt_condition: "",
      fan_noise_level: "",
      dampers_operation: "",
      coils_condition: "",
      sensors_operation: "",
      motor_condition: "",
      drain_pan_status: "",
      airflow_reading: "",
      airflow_unit: "CFM",
      
      // Boolean defaults
      unusual_noise: false,
      vibration_observed: false,
      air_filter_cleaned: false,
      fan_bearings_lubricated: false,
      unusual_noise_elevator: false,
      vibration_elevator: false,
      
      // Notes defaults
      restroom_notes: "",
      elevator_notes: "",
      troubleshooting_notes: "",
      corrective_actions: "",
      maintenance_recommendations: "",
      
      // Internal tracking
      selected_location: "",
    },
    mode: "onChange",
  });

  return form;
};

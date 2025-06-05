
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceFormSchema, MaintenanceFormValues } from "./schema/maintenanceFormSchema";
import { MaintenanceCheck } from "@/types/maintenance";

export const useMaintenanceForm = (initialData?: MaintenanceCheck) => {
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      location_id: initialData?.location_id || "",
      equipment_id: initialData?.equipment_id || "",
      technician_id: initialData?.technician_id || "",
      notes: initialData?.notes || "",
      
      // Set proper default values as strings, not objects
      chiller_pressure_reading: initialData?.chiller_pressure_reading?.toString() || "",
      chiller_temperature_reading: initialData?.chiller_temperature_reading?.toString() || "",
      air_filter_status: initialData?.air_filter_status || "",
      belt_condition: initialData?.belt_condition || "",
      refrigerant_level: initialData?.refrigerant_level || "",
      oil_level_status: initialData?.oil_level_status || "",
      condenser_condition: initialData?.condenser_condition || "",
      
      // AHU defaults
      air_filter_cleaned: initialData?.air_filter_cleaned || false,
      fan_belt_condition: initialData?.fan_belt_condition || "",
      fan_bearings_lubricated: initialData?.fan_bearings_lubricated || false,
      fan_noise_level: initialData?.fan_noise_level || "",
      dampers_operation: initialData?.dampers_operation || "",
      coils_condition: initialData?.coils_condition || "",
      sensors_operation: initialData?.sensors_operation || "",
      motor_condition: initialData?.motor_condition || "",
      drain_pan_status: initialData?.drain_pan_status || "",
      airflow_reading: initialData?.airflow_reading?.toString() || "",
      airflow_unit: initialData?.airflow_unit || "CFM",
      
      // Boolean defaults
      unusual_noise: initialData?.unusual_noise || false,
      vibration_observed: initialData?.vibration_observed || false,
      unusual_noise_elevator: initialData?.unusual_noise_elevator || false,
      vibration_elevator: initialData?.vibration_elevator || false,
      
      // Elevator fields
      elevator_operation: initialData?.elevator_operation || "",
      door_operation: initialData?.door_operation || "",
      emergency_phone: initialData?.emergency_phone || "",
      elevator_lighting: initialData?.elevator_lighting || "",
      elevator_notes: initialData?.elevator_notes || "",
      
      // Restroom fields
      sink_status: initialData?.sink_status || "",
      toilet_status: initialData?.toilet_status || "",
      urinal_status: initialData?.urinal_status || "",
      hand_dryer_status: initialData?.hand_dryer_status || "",
      cleanliness_level: initialData?.cleanliness_level || "",
      soap_supply: initialData?.soap_supply || "",
      toilet_paper_supply: initialData?.toilet_paper_supply || "",
      floor_condition: initialData?.floor_condition || "",
      restroom_notes: initialData?.restroom_notes || "",
      
      // Notes defaults
      troubleshooting_notes: initialData?.troubleshooting_notes || "",
      corrective_actions: initialData?.corrective_actions || "",
      maintenance_recommendations: initialData?.maintenance_recommendations || "",
      
      // Internal tracking
      selected_location: "",
    },
    mode: "onChange",
  });

  return form;
};

// Export the type for backward compatibility
export type { MaintenanceFormValues };


import { MaintenanceCheck } from "@/types/maintenance";
import { MaintenanceFormValues } from "../schema/maintenanceFormSchema";

/**
 * Creates default values for the maintenance form
 * @param initialData Optional initial data from an existing maintenance check
 * @returns Default values for form initialization
 */
export const createDefaultValues = (initialData?: MaintenanceCheck): Partial<MaintenanceFormValues> => {
  if (initialData) {
    // Properly cast reading_mode to ensure type safety
    const readingMode = initialData.reading_mode as "standard" | "manual" | "ai_image" | undefined;
    
    return {
      ...initialData,
      reading_mode: readingMode || "standard",
      chiller_pressure_reading: initialData.chiller_pressure_reading?.toString() || "NA",
      chiller_temperature_reading: initialData.chiller_temperature_reading?.toString() || "NA",
      airflow_reading: initialData.airflow_reading?.toString() || "NA",
      location_id: initialData.location_id || "",
    };
  }
  
  return {
    unusual_noise: false,
    vibration_observed: false,
    air_filter_cleaned: false,
    fan_bearings_lubricated: false,
    unusual_noise_elevator: false,
    vibration_elevator: false,
    reading_mode: "standard",
    selected_location: "",
    location_id: "",
    equipment_id: "",
    technician_id: "",
    notes: "",
    restroom_notes: "",
    elevator_notes: "",
    troubleshooting_notes: "",
    corrective_actions: "",
    maintenance_recommendations: "",
  };
};

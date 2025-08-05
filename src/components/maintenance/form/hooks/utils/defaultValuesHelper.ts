
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
    
    // Fix: Convert all numeric fields to strings to match form schema
    return {
      ...initialData,
      reading_mode: readingMode || "standard",
      chiller_pressure_reading: initialData.chiller_pressure_reading?.toString() || "NA",
      chiller_temperature_reading: initialData.chiller_temperature_reading?.toString() || "NA",
      airflow_reading: initialData.airflow_reading?.toString() || "NA",
      // Fix: Convert ambient_temperature to string
      ambient_temperature: initialData.ambient_temperature?.toString() || "",
      humidity_level: initialData.humidity_level?.toString() || "",
      system_efficiency_rating: initialData.system_efficiency_rating?.toString() || "",
      energy_consumption_kwh: initialData.energy_consumption_kwh?.toString() || "",
      operating_hours: initialData.operating_hours?.toString() || "",
      cooling_capacity_tons: initialData.cooling_capacity_tons?.toString() || "",
      heating_capacity_btuh: initialData.heating_capacity_btuh?.toString() || "",
      efficiency_cop: initialData.efficiency_cop?.toString() || "",
      water_ph_level: initialData.water_ph_level?.toString() || "",
      water_conductivity: initialData.water_conductivity?.toString() || "",
      maintenance_duration_minutes: initialData.maintenance_duration_minutes?.toString() || "",
      labor_cost: initialData.labor_cost?.toString() || "",
      parts_cost: initialData.parts_cost?.toString() || "",
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

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
    
    // Convert all numeric fields to strings to match form schema, except conductivity fields which are numbers
    return {
      ...initialData,
      reading_mode: readingMode || "standard",
      chiller_pressure_reading: initialData.chiller_pressure_reading?.toString() || "NA",
      chiller_temperature_reading: initialData.chiller_temperature_reading?.toString() || "NA",
      airflow_reading: initialData.airflow_reading?.toString() || "NA",
      
      // Environmental readings
      ambient_temperature: initialData.ambient_temperature?.toString() || "",
      humidity_level: initialData.humidity_level?.toString() || "",
      
      // Performance fields
      system_efficiency_rating: initialData.system_efficiency_rating?.toString() || "",
      energy_consumption_kwh: initialData.energy_consumption_kwh?.toString() || "",
      operating_hours: initialData.operating_hours?.toString() || "",
      cooling_capacity_tons: initialData.cooling_capacity_tons?.toString() || "",
      heating_capacity_btuh: initialData.heating_capacity_btuh?.toString() || "",
      efficiency_cop: initialData.efficiency_cop?.toString() || "",
      
      // Water treatment
      water_ph_level: initialData.water_ph_level?.toString() || "",
      water_conductivity: initialData.water_conductivity?.toString() || "",
      
      // Cost fields
      maintenance_duration_minutes: initialData.maintenance_duration_minutes?.toString() || "",
      labor_cost: initialData.labor_cost?.toString() || "",
      parts_cost: initialData.parts_cost?.toString() || "",
      
      // Comprehensive chiller evaporator fields
      evaporator_leaving_water_temp: initialData.evaporator_leaving_water_temp?.toString() || "",
      evaporator_entering_water_temp: initialData.evaporator_entering_water_temp?.toString() || "",
      evap_sat_rfgt_temp: initialData.evap_sat_rfgt_temp?.toString() || "",
      evap_rfgt_pressure: initialData.evap_rfgt_pressure?.toString() || "",
      evap_approach_temp: initialData.evap_approach_temp?.toString() || "",
      active_chilled_water_setpoint: initialData.active_chilled_water_setpoint?.toString() || "",
      
      // Comprehensive chiller condenser fields
      condenser_entering_water_temp: initialData.condenser_entering_water_temp?.toString() || "",
      condenser_leaving_water_temp: initialData.condenser_leaving_water_temp?.toString() || "",
      cond_sat_rfgt_temp: initialData.cond_sat_rfgt_temp?.toString() || "",
      cond_rfgt_pressure: initialData.cond_rfgt_pressure?.toString() || "",
      cond_approach_temp: initialData.cond_approach_temp?.toString() || "",
      differential_refrigerant_pressure: initialData.differential_refrigerant_pressure?.toString() || "",
      
      // Comprehensive chiller compressor fields
      average_motor_current_pct_rla: initialData.average_motor_current_pct_rla?.toString() || "",
      compressor_starts: initialData.compressor_starts?.toString() || "",
      oil_differential_pressure: initialData.oil_differential_pressure?.toString() || "",
      compressor_running_time: initialData.compressor_running_time?.toString() || "",
      oil_pump_discharge_pressure: initialData.oil_pump_discharge_pressure?.toString() || "",
      oil_tank_pressure: initialData.oil_tank_pressure?.toString() || "",
      compressor_refrigerant_discharge_temp: initialData.compressor_refrigerant_discharge_temp?.toString() || "",
      
      // Comprehensive chiller motor fields
      active_current_limit_setpoint: initialData.active_current_limit_setpoint?.toString() || "",
      average_motor_current_pct_rla_motor: initialData.average_motor_current_pct_rla_motor?.toString() || "",
      motor_frequency: initialData.motor_frequency?.toString() || "",
      starter_motor_current_l1_pct_rla: initialData.starter_motor_current_l1_pct_rla?.toString() || "",
      starter_motor_current_l2_pct_rla: initialData.starter_motor_current_l2_pct_rla?.toString() || "",
      starter_motor_current_l3_pct_rla: initialData.starter_motor_current_l3_pct_rla?.toString() || "",
      starter_motor_current_l1: initialData.starter_motor_current_l1?.toString() || "",
      starter_motor_current_l2: initialData.starter_motor_current_l2?.toString() || "",
      starter_motor_current_l3: initialData.starter_motor_current_l3?.toString() || "",
      afd_input_current_l1: initialData.afd_input_current_l1?.toString() || "",
      afd_input_current_l2: initialData.afd_input_current_l2?.toString() || "",
      afd_input_current_l3: initialData.afd_input_current_l3?.toString() || "",
      
      // Cooling tower conductivity fields - keep as numbers since schema defines them as numbers
      city_conductivity_us_cm: initialData.city_conductivity_us_cm || undefined,
      tower_conductivity_us_cm: initialData.tower_conductivity_us_cm || undefined,
      
      // Keep other fields as they are
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

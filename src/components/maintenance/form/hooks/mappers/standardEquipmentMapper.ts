
import { processField, processNumberField } from "../utils/formValueProcessors";
import { MaintenanceFormValues } from "../schema/maintenanceFormSchema";

/**
 * Maps form values to standard HVAC equipment database fields
 */
export const mapStandardEquipmentData = (values: MaintenanceFormValues, equipmentType: string) => {
  // Skip if equipment is of specialized type that has its own mapper
  if (equipmentType === 'elevator' || equipmentType === 'restroom' || equipmentType === 'chiller') return {};
  
  const baseFields = {
    // Convert string values to numbers where appropriate
    chiller_pressure_reading: processNumberField(values.chiller_pressure_reading),
    chiller_temperature_reading: processNumberField(values.chiller_temperature_reading),
    airflow_reading: processNumberField(values.airflow_reading),
    
    // Copy over standard fields
    air_filter_status: processField(values.air_filter_status),
    belt_condition: processField(values.belt_condition),
    refrigerant_level: processField(values.refrigerant_level),
    unusual_noise: values.unusual_noise ?? false,
    vibration_observed: values.vibration_observed ?? false,
    oil_level_status: processField(values.oil_level_status),
    condenser_condition: processField(values.condenser_condition),
    notes: processField(values.notes),
    
    // AHU specific fields
    air_filter_cleaned: values.air_filter_cleaned ?? false,
    fan_belt_condition: processField(values.fan_belt_condition),
    fan_bearings_lubricated: values.fan_bearings_lubricated ?? false,
    fan_noise_level: processField(values.fan_noise_level),
    dampers_operation: processField(values.dampers_operation),
    coils_condition: processField(values.coils_condition),
    sensors_operation: processField(values.sensors_operation),
    motor_condition: processField(values.motor_condition),
    drain_pan_status: processField(values.drain_pan_status),
    airflow_unit: processField(values.airflow_unit),
    troubleshooting_notes: processField(values.troubleshooting_notes),
    corrective_actions: processField(values.corrective_actions),
    maintenance_recommendations: processField(values.maintenance_recommendations),
    
    // Environmental readings
    ambient_temperature: processNumberField(values.ambient_temperature),
    humidity_level: processNumberField(values.humidity_level),
    
    // Electrical and safety
    electrical_connections_condition: processField(values.electrical_connections_condition),
    control_panel_condition: processField(values.control_panel_condition),
    safety_switches_status: processField(values.safety_switches_status),
    
    // Maintenance actions (common to all equipment)
    filters_replaced: values.filters_replaced ?? false,
    coils_cleaned: values.coils_cleaned ?? false,
    belts_inspected: values.belts_inspected ?? false,
    bearings_lubricated: values.bearings_lubricated ?? false,
    refrigerant_checked: values.refrigerant_checked ?? false,
    
    // Performance and efficiency
    system_efficiency_rating: processNumberField(values.system_efficiency_rating),
    energy_consumption_kwh: processNumberField(values.energy_consumption_kwh),
    operating_hours: processNumberField(values.operating_hours),
    
    // Follow-up and costs
    inspection_notes: processField(values.inspection_notes),
    follow_up_required: values.follow_up_required ?? false,
    next_inspection_date: values.next_inspection_date ? new Date(values.next_inspection_date).toISOString() : null,
    maintenance_duration_minutes: processNumberField(values.maintenance_duration_minutes),
    labor_cost: processNumberField(values.labor_cost),
    parts_cost: processNumberField(values.parts_cost),
    parts_used: values.parts_used ? JSON.parse(JSON.stringify(values.parts_used)) : null
  };

  // Add cooling tower specific fields if equipment type is cooling_tower
  if (equipmentType === 'cooling_tower') {
    return {
      ...baseFields,
      // Cooling tower specific fields
      fill_media_condition: processField(values.fill_media_condition),
      drift_eliminators_condition: processField(values.drift_eliminators_condition),
      fan_assembly_status: processField(values.fan_assembly_status),
      motor_lubrication_status: processField(values.motor_lubrication_status),
      pump_seals_condition: processField(values.pump_seals_condition),
      strainer_status: processField(values.strainer_status),
      sump_basin_condition: processField(values.sump_basin_condition),
      water_system_status: processField(values.water_system_status),
      drainage_system_status: processField(values.drainage_system_status),
      control_system_status: processField(values.control_system_status),
      sensor_status: processField(values.sensor_status),
      seasonal_preparation_status: processField(values.seasonal_preparation_status),
      vibration_monitoring: processField(values.vibration_monitoring),
      emergency_shutdown_status: processField(values.emergency_shutdown_status),
      // Conductivity readings
      city_conductivity_us_cm: processNumberField(values.city_conductivity_us_cm),
      tower_conductivity_us_cm: processNumberField(values.tower_conductivity_us_cm),
      // Water treatment
      water_ph_level: processNumberField(values.water_ph_level),
      water_conductivity: processNumberField(values.water_conductivity),
      chemical_treatment_status: processField(values.chemical_treatment_status)
    };
  }

  return baseFields;
};


import { processField, processNumberField } from "../utils/formValueProcessors";
import { MaintenanceFormValues } from "../schema/maintenanceFormSchema";

/**
 * Maps form values to comprehensive chiller database fields
 */
export const mapChillerData = (values: MaintenanceFormValues, equipmentType: string) => {
  if (equipmentType !== 'chiller') return {};
  
  return {
    // Evaporator fields
    evaporator_approach_temp: processNumberField(values.evap_approach_temp),
    evaporator_leaving_water_temp: processNumberField(values.evaporator_leaving_water_temp),
    evaporator_entering_water_temp: processNumberField(values.evaporator_entering_water_temp),
    evaporator_pressure_drop: processNumberField(values.evap_rfgt_pressure),
    evaporator_flow_rate: processNumberField(values.evap_water_flow_status),
    evaporator_condition: processField(values.evaporator_condition),
    
    // Condenser fields
    condenser_approach_temp: processNumberField(values.cond_approach_temp),
    condenser_entering_water_temp: processNumberField(values.condenser_entering_water_temp),
    condenser_leaving_water_temp: processNumberField(values.condenser_leaving_water_temp),
    condenser_pressure_drop: processNumberField(values.differential_refrigerant_pressure),
    condenser_flow_rate: processNumberField(values.cond_water_flow_status),
    
    // Compressor fields
    compressor_suction_temp: processNumberField(values.evap_sat_rfgt_temp),
    compressor_discharge_temp: processNumberField(values.compressor_refrigerant_discharge_temp),
    compressor_suction_pressure: processNumberField(values.evap_rfgt_pressure),
    compressor_discharge_pressure: processNumberField(values.cond_rfgt_pressure),
    compressor_superheat: processNumberField(values.differential_refrigerant_pressure),
    compressor_subcooling: processNumberField(values.cond_sat_rfgt_temp),
    compressor_oil_pressure: processNumberField(values.oil_differential_pressure),
    compressor_oil_temp: processNumberField(values.oil_tank_pressure),
    compressor_condition: processField(values.compressor_running_status),
    
    // Motor fields
    motor_amperage_rla: processNumberField(values.average_motor_current_pct_rla),
    motor_voltage_phase1: processNumberField(values.starter_motor_current_l1),
    motor_voltage_phase2: processNumberField(values.starter_motor_current_l2),
    motor_voltage_phase3: processNumberField(values.starter_motor_current_l3),
    motor_temperature: processNumberField(values.compressor_refrigerant_discharge_temp),
    motor_vibration: processNumberField(values.motor_frequency),
    
    // Performance metrics
    system_efficiency_rating: processNumberField(values.efficiency_cop),
    energy_consumption_kwh: processNumberField(values.energy_consumption_kwh),
    operating_hours: processNumberField(values.compressor_running_time),
    cooling_capacity_tons: processNumberField(values.cooling_capacity_tons),
    efficiency_cop: processNumberField(values.efficiency_cop),
    
    // Water treatment
    water_ph_level: processNumberField(values.water_ph_level),
    water_conductivity: processNumberField(values.water_conductivity),
    chemical_treatment_status: processField(values.chemical_treatment_status),
    
    // Maintenance actions
    filters_replaced: values.filters_replaced ?? false,
    coils_cleaned: values.coils_cleaned ?? false,
    belts_inspected: values.belts_inspected ?? false,
    bearings_lubricated: values.bearings_lubricated ?? false,
    refrigerant_checked: values.refrigerant_checked ?? false,
    
    // Electrical and safety
    electrical_connections_condition: processField(values.electrical_connections_condition),
    control_panel_condition: processField(values.control_panel_condition),
    safety_switches_status: processField(values.safety_switches_status),
    
    // Follow-up and costs
    inspection_notes: processField(values.inspection_notes),
    follow_up_required: values.follow_up_required ?? false,
    next_inspection_date: values.next_inspection_date ? new Date(values.next_inspection_date).toISOString() : null,
    maintenance_duration_minutes: processNumberField(values.maintenance_duration_minutes),
    labor_cost: processNumberField(values.labor_cost),
    parts_cost: processNumberField(values.parts_cost),
    parts_used: values.parts_used ? JSON.parse(JSON.stringify(values.parts_used)) : null
  };
};

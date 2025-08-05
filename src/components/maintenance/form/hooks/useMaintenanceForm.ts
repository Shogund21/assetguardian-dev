import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaintenanceFormValues, maintenanceFormSchema } from "./schema/maintenanceFormSchema";
import { MaintenanceCheck } from "@/types/maintenance";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export const useMaintenanceForm = (initialData?: MaintenanceCheck) => {
  const { userProfile } = useAuth();
  
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      location_id: initialData?.location_id || "",
      equipment_id: initialData?.equipment_id || "",
      technician_id: initialData?.technician_id || "",
      company_id: userProfile?.company_id || "",
      maintenance_frequency: initialData?.maintenance_frequency || "daily",
      reading_mode: (initialData?.reading_mode as "standard" | "manual" | "ai_image") || "standard",
      notes: initialData?.notes || "",
      
      // Standard HVAC fields
      chiller_pressure_reading: initialData?.chiller_pressure_reading?.toString() || "",
      chiller_temperature_reading: initialData?.chiller_temperature_reading?.toString() || "",
      air_filter_status: initialData?.air_filter_status || "",
      belt_condition: initialData?.belt_condition || "",
      refrigerant_level: initialData?.refrigerant_level || "",
      unusual_noise: initialData?.unusual_noise || false,
      vibration_observed: initialData?.vibration_observed || false,
      oil_level_status: initialData?.oil_level_status || "",
      condenser_condition: initialData?.condenser_condition || "",
      
      // AHU specific fields
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
      airflow_unit: initialData?.airflow_unit || "",
      
      // Comprehensive chiller evaporator fields
      evaporator_leaving_water_temp: initialData?.evaporator_leaving_water_temp?.toString() || "",
      evaporator_entering_water_temp: initialData?.evaporator_entering_water_temp?.toString() || "",
      evap_sat_rfgt_temp: initialData?.evap_sat_rfgt_temp?.toString() || "",
      evap_rfgt_pressure: initialData?.evap_rfgt_pressure?.toString() || "",
      evap_approach_temp: initialData?.evap_approach_temp?.toString() || "",
      active_chilled_water_setpoint: initialData?.active_chilled_water_setpoint?.toString() || "",
      evaporator_pump_override: initialData?.evaporator_pump_override || "",
      evap_water_flow_status: initialData?.evap_water_flow_status || "",
      evaporator_condition: initialData?.evaporator_condition || "",
      
      // Comprehensive chiller condenser fields
      condenser_entering_water_temp: initialData?.condenser_entering_water_temp?.toString() || "",
      condenser_leaving_water_temp: initialData?.condenser_leaving_water_temp?.toString() || "",
      cond_sat_rfgt_temp: initialData?.cond_sat_rfgt_temp?.toString() || "",
      cond_rfgt_pressure: initialData?.cond_rfgt_pressure?.toString() || "",
      cond_approach_temp: initialData?.cond_approach_temp?.toString() || "",
      differential_refrigerant_pressure: initialData?.differential_refrigerant_pressure?.toString() || "",
      condenser_pump_override: initialData?.condenser_pump_override || "",
      cond_water_flow_status: initialData?.cond_water_flow_status || "",
      
      // Comprehensive chiller compressor fields
      compressor_running_status: initialData?.compressor_running_status || "",
      chiller_control_signal: initialData?.chiller_control_signal || "",
      average_motor_current_pct_rla: initialData?.average_motor_current_pct_rla?.toString() || "",
      compressor_starts: initialData?.compressor_starts?.toString() || "",
      oil_differential_pressure: initialData?.oil_differential_pressure?.toString() || "",
      compressor_running_time: initialData?.compressor_running_time?.toString() || "",
      oil_pump_discharge_pressure: initialData?.oil_pump_discharge_pressure?.toString() || "",
      oil_tank_pressure: initialData?.oil_tank_pressure?.toString() || "",
      compressor_refrigerant_discharge_temp: initialData?.compressor_refrigerant_discharge_temp?.toString() || "",
      oil_pump_control: initialData?.oil_pump_control || "",
      oil_pump_command: initialData?.oil_pump_command || "",
      
      // Comprehensive chiller motor fields
      active_current_limit_setpoint: initialData?.active_current_limit_setpoint?.toString() || "",
      average_motor_current_pct_rla_motor: initialData?.average_motor_current_pct_rla_motor?.toString() || "",
      motor_frequency: initialData?.motor_frequency?.toString() || "",
      starter_motor_current_l1_pct_rla: initialData?.starter_motor_current_l1_pct_rla?.toString() || "",
      starter_motor_current_l2_pct_rla: initialData?.starter_motor_current_l2_pct_rla?.toString() || "",
      starter_motor_current_l3_pct_rla: initialData?.starter_motor_current_l3_pct_rla?.toString() || "",
      starter_motor_current_l1: initialData?.starter_motor_current_l1?.toString() || "",
      starter_motor_current_l2: initialData?.starter_motor_current_l2?.toString() || "",
      starter_motor_current_l3: initialData?.starter_motor_current_l3?.toString() || "",
      afd_input_current_l1: initialData?.afd_input_current_l1?.toString() || "",
      afd_input_current_l2: initialData?.afd_input_current_l2?.toString() || "",
      afd_input_current_l3: initialData?.afd_input_current_l3?.toString() || "",
      
      // Environmental and performance fields
      ambient_temperature: initialData?.ambient_temperature?.toString() || "",
      humidity_level: initialData?.humidity_level?.toString() || "",
      system_efficiency_rating: initialData?.system_efficiency_rating?.toString() || "",
      energy_consumption_kwh: initialData?.energy_consumption_kwh?.toString() || "",
      operating_hours: initialData?.operating_hours?.toString() || "",
      cooling_capacity_tons: initialData?.cooling_capacity_tons?.toString() || "",
      heating_capacity_btuh: initialData?.heating_capacity_btuh?.toString() || "",
      efficiency_cop: initialData?.efficiency_cop?.toString() || "",
      
      // Water treatment fields
      water_ph_level: initialData?.water_ph_level?.toString() || "",
      water_conductivity: initialData?.water_conductivity?.toString() || "",
      chemical_treatment_status: initialData?.chemical_treatment_status || "",
      
      // Electrical and safety fields
      electrical_connections_condition: initialData?.electrical_connections_condition || "",
      control_panel_condition: initialData?.control_panel_condition || "",
      safety_switches_status: initialData?.safety_switches_status || "",
      
      // Maintenance action fields
      filters_replaced: initialData?.filters_replaced || false,
      coils_cleaned: initialData?.coils_cleaned || false,
      belts_inspected: initialData?.belts_inspected || false,
      bearings_lubricated: initialData?.bearings_lubricated || false,
      refrigerant_checked: initialData?.refrigerant_checked || false,
      
      // Follow-up and cost fields
      inspection_notes: initialData?.inspection_notes || "",
      follow_up_required: initialData?.follow_up_required || false,
      next_inspection_date: initialData?.next_inspection_date ? new Date(initialData.next_inspection_date).toISOString().split('T')[0] : "",
      maintenance_duration_minutes: initialData?.maintenance_duration_minutes?.toString() || "",
      labor_cost: initialData?.labor_cost?.toString() || "",
      parts_cost: initialData?.parts_cost?.toString() || "",
      parts_used: initialData?.parts_used ? JSON.stringify(initialData.parts_used) : "",
      
      // Cooling Tower fields
      city_conductivity_us_cm: initialData?.city_conductivity_us_cm || undefined,
      tower_conductivity_us_cm: initialData?.tower_conductivity_us_cm || undefined,
      fill_media_condition: initialData?.fill_media_condition || "",
      drift_eliminators_condition: initialData?.drift_eliminators_condition || "",
      fan_assembly_status: initialData?.fan_assembly_status || "",
      motor_lubrication_status: initialData?.motor_lubrication_status || "",
      pump_seals_condition: initialData?.pump_seals_condition || "",
      strainer_status: initialData?.strainer_status || "",
      sump_basin_condition: initialData?.sump_basin_condition || "",
      water_system_status: initialData?.water_system_status || "",
      drainage_system_status: initialData?.drainage_system_status || "",
      control_system_status: initialData?.control_system_status || "",
      sensor_status: initialData?.sensor_status || "",
      seasonal_preparation_status: initialData?.seasonal_preparation_status || "",
      vibration_monitoring: initialData?.vibration_monitoring || "",
      emergency_shutdown_status: initialData?.emergency_shutdown_status || "",
      
      // Elevator fields
      unusual_noise_elevator: initialData?.unusual_noise_elevator || false,
      vibration_elevator: initialData?.vibration_elevator || false,
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
      
      // Notes and recommendations
      troubleshooting_notes: initialData?.troubleshooting_notes || "",
      corrective_actions: initialData?.corrective_actions || "",
      maintenance_recommendations: initialData?.maintenance_recommendations || "",
      
      manual_readings: [],
      selected_location: ""
    }
  });

  // Update company_id when userProfile changes
  useEffect(() => {
    if (userProfile?.company_id && !form.getValues().company_id) {
      form.setValue('company_id', userProfile.company_id);
    }
  }, [userProfile?.company_id, form]);

  return form;
};

export type { MaintenanceFormValues };

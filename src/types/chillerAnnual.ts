// Types for Annual Chiller Maintenance & Risk Intelligence Module

export interface ChillerRefRiskLevel {
  id: string;
  code: string;
  label: string;
  color_hex: string | null;
  priority_weight: number;
  sort_order: number;
  is_active: boolean;
}

export interface ChillerRefLeakLocation {
  id: string;
  code: string;
  label: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ChillerRefSightGlassCondition {
  id: string;
  code: string;
  label: string;
  severity_score: number | null;
  sort_order: number;
  is_active: boolean;
}

export interface ChillerRefStarterCondition {
  id: string;
  code: string;
  label: string;
  risk_score: number | null;
  sort_order: number;
  is_active: boolean;
}

export interface ChillerRefIssueCode {
  id: string;
  code: string;
  category: string;
  label: string;
  description: string | null;
  recommended_action: string | null;
  default_risk_level: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ChillerRefTubeTestMethod {
  id: string;
  code: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

export interface AnnualChillerPM {
  id: string;
  equipment_id: string;
  company_id: string | null;
  location_id: string | null;
  technician_id: string | null;
  inspection_year: number;
  inspection_date: string;
  scheduled_date: string | null;
  chiller_model: string | null;
  chiller_serial: string | null;
  chiller_age_years: number | null;
  operating_hours_at_inspection: number | null;
  status: 'draft' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled';
  overall_risk_level: string | null;
  overall_risk_score: number | null;
  requires_immediate_action: boolean;
  next_annual_due: string | null;
  completion_date: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  labor_hours_total: number | null;
  parts_cost_total: number | null;
  labor_cost_total: number | null;
  notes: string | null;
  ai_analysis_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Joined data
  equipment?: {
    name: string;
    location: string;
    type: string | null;
  };
  technician?: {
    firstName: string;
    lastName: string;
  };
}

export interface ChillerRefrigerantInspection {
  id: string;
  annual_pm_id: string;
  refrigerant_type: string | null;
  charge_lbs: number | null;
  nameplate_charge_lbs: number | null;
  charge_variance_pct: number | null;
  leak_detected: boolean;
  leak_location_code: string | null;
  leak_rate_oz_year: number | null;
  recovery_amount_lbs: number | null;
  added_amount_lbs: number | null;
  suction_pressure_psig: number | null;
  discharge_pressure_psig: number | null;
  subcooling_f: number | null;
  superheat_f: number | null;
  sight_glass_condition: string | null;
  moisture_indicator_color: string | null;
  acid_test_passed: boolean | null;
  acid_ppm: number | null;
  non_condensable_test_passed: boolean | null;
  purge_unit_hours: number | null;
  purge_unit_cycles: number | null;
  drier_replaced: boolean;
  drier_moisture_ppm: number | null;
  risk_level: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChillerOilAnalysis {
  id: string;
  annual_pm_id: string;
  oil_type: string | null;
  oil_capacity_gallons: number | null;
  current_level_pct: number | null;
  oil_changed: boolean;
  oil_added_gallons: number | null;
  sample_collected: boolean;
  sample_lab_id: string | null;
  sample_date: string | null;
  viscosity_cst_40c: number | null;
  viscosity_cst_100c: number | null;
  acid_number_mgkoh_g: number | null;
  moisture_ppm: number | null;
  iron_ppm: number | null;
  copper_ppm: number | null;
  aluminum_ppm: number | null;
  silicon_ppm: number | null;
  tin_ppm: number | null;
  lead_ppm: number | null;
  oxidation_number: number | null;
  dielectric_strength_kv: number | null;
  foam_test_passed: boolean | null;
  appearance: string | null;
  oil_heater_functional: boolean | null;
  oil_pump_pressure_psig: number | null;
  oil_filter_replaced: boolean;
  oil_filter_dp_psig: number | null;
  risk_level: string | null;
  lab_recommendations: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChillerTubeInspection {
  id: string;
  annual_pm_id: string;
  bundle_type: 'evaporator' | 'condenser';
  tube_count_total: number | null;
  test_method: string | null;
  tubes_tested_count: number | null;
  tubes_tested_pct: number | null;
  tubes_plugged_previous: number | null;
  tubes_plugged_new: number | null;
  tubes_plugged_total: number | null;
  plugged_pct: number | null;
  tubes_with_pitting: number | null;
  tubes_with_thinning: number | null;
  min_wall_thickness_mils: number | null;
  avg_wall_thickness_mils: number | null;
  original_wall_thickness_mils: number | null;
  wall_loss_pct: number | null;
  fouling_factor_measured: number | null;
  fouling_factor_design: number | null;
  fouling_severity: 'none' | 'light' | 'moderate' | 'heavy' | 'severe' | null;
  fouling_type: string | null;
  tubes_cleaned: boolean;
  cleaning_method: string | null;
  approach_temp_before_f: number | null;
  approach_temp_after_f: number | null;
  waterbox_condition: string | null;
  waterbox_gaskets_replaced: boolean;
  tube_sheet_condition: string | null;
  sacrificial_anodes_replaced: boolean | null;
  anode_depletion_pct: number | null;
  estimated_remaining_life_years: number | null;
  risk_level: string | null;
  next_test_recommended: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChillerWaterSideInspection {
  id: string;
  annual_pm_id: string;
  water_loop: 'chilled_water' | 'condenser_water';
  entering_water_temp_f: number | null;
  leaving_water_temp_f: number | null;
  delta_t_f: number | null;
  design_delta_t_f: number | null;
  flow_rate_gpm: number | null;
  design_flow_gpm: number | null;
  flow_variance_pct: number | null;
  pressure_drop_psig: number | null;
  design_pressure_drop_psig: number | null;
  pump_suction_pressure_psig: number | null;
  pump_discharge_pressure_psig: number | null;
  strainer_cleaned: boolean;
  strainer_dp_psig: number | null;
  valve_operation_checked: boolean;
  isolation_valves_condition: string | null;
  expansion_tank_level_pct: number | null;
  air_separator_functional: boolean | null;
  glycol_concentration_pct: number | null;
  risk_level: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChillerWaterQuality {
  id: string;
  annual_pm_id: string;
  water_loop: 'chilled_water' | 'condenser_water' | 'makeup';
  sample_date: string | null;
  sample_location: string | null;
  ph: number | null;
  conductivity_umhos: number | null;
  total_dissolved_solids_ppm: number | null;
  hardness_ppm_caco3: number | null;
  alkalinity_ppm: number | null;
  chlorides_ppm: number | null;
  sulfates_ppm: number | null;
  silica_ppm: number | null;
  iron_ppm: number | null;
  copper_ppm: number | null;
  bacteria_count_cfu_ml: number | null;
  legionella_detected: boolean | null;
  legionella_cfu_l: number | null;
  biocide_residual_ppm: number | null;
  inhibitor_residual_ppm: number | null;
  cycles_of_concentration: number | null;
  langelier_saturation_index: number | null;
  ryznar_stability_index: number | null;
  within_spec: boolean | null;
  treatment_vendor: string | null;
  risk_level: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChillerElectricalCheck {
  id: string;
  annual_pm_id: string;
  component: 'main_motor' | 'oil_pump' | 'purge' | 'controls' | 'vfd';
  voltage_l1_l2: number | null;
  voltage_l2_l3: number | null;
  voltage_l3_l1: number | null;
  voltage_imbalance_pct: number | null;
  amperage_l1: number | null;
  amperage_l2: number | null;
  amperage_l3: number | null;
  amperage_imbalance_pct: number | null;
  nameplate_fla: number | null;
  current_pct_fla: number | null;
  power_factor: number | null;
  kw_measured: number | null;
  insulation_resistance_megohms: number | null;
  winding_temp_f: number | null;
  bearing_temp_drive_end_f: number | null;
  bearing_temp_non_drive_f: number | null;
  vibration_ips_de: number | null;
  vibration_ips_nde: number | null;
  vibration_acceptable: boolean | null;
  starter_condition: string | null;
  contactor_condition: string | null;
  overload_setting_amps: number | null;
  overload_functional: boolean | null;
  control_wiring_condition: string | null;
  terminal_connections_tight: boolean | null;
  vfd_fault_history_cleared: boolean | null;
  vfd_firmware_version: string | null;
  risk_level: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChillerPerformanceTest {
  id: string;
  annual_pm_id: string;
  test_date: string | null;
  test_duration_minutes: number | null;
  load_pct: number | null;
  chilled_water_supply_f: number | null;
  chilled_water_return_f: number | null;
  chw_delta_t_f: number | null;
  chw_flow_gpm: number | null;
  condenser_water_supply_f: number | null;
  condenser_water_return_f: number | null;
  cw_delta_t_f: number | null;
  cw_flow_gpm: number | null;
  evaporator_sat_temp_f: number | null;
  condenser_sat_temp_f: number | null;
  evaporator_approach_f: number | null;
  condenser_approach_f: number | null;
  suction_pressure_psig: number | null;
  discharge_pressure_psig: number | null;
  lift_psig: number | null;
  oil_pressure_psig: number | null;
  motor_amps: number | null;
  kw_input: number | null;
  tons_actual: number | null;
  tons_design: number | null;
  capacity_pct: number | null;
  kw_per_ton: number | null;
  design_kw_per_ton: number | null;
  efficiency_variance_pct: number | null;
  cop: number | null;
  iplv: number | null;
  nplv: number | null;
  guide_vane_position_pct: number | null;
  slide_valve_position_pct: number | null;
  meets_design_capacity: boolean | null;
  meets_design_efficiency: boolean | null;
  degradation_since_last_year_pct: number | null;
  risk_level: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChillerAnnualFinding {
  id: string;
  annual_pm_id: string;
  finding_number: number | null;
  issue_code: string | null;
  category: string | null;
  description: string;
  location_detail: string | null;
  severity: string;
  is_repeat_finding: boolean;
  prior_finding_id: string | null;
  recommended_action: string | null;
  action_taken: string | null;
  action_date: string | null;
  parts_required: string[] | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  responsible_party: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'deferred' | 'wont_fix';
  resolution_date: string | null;
  resolution_notes: string | null;
  requires_follow_up: boolean;
  follow_up_date: string | null;
  ai_confidence_score: number | null;
  ai_recommendation: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  attachments?: ChillerFindingAttachment[];
}

export interface ChillerFindingAttachment {
  id: string;
  finding_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  is_primary: boolean;
  caption: string | null;
  taken_at: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  uploaded_by: string | null;
  uploaded_at: string;
  created_at: string;
}

// Complete annual PM with all sub-inspections
export interface AnnualChillerPMComplete extends AnnualChillerPM {
  refrigerant_inspection?: ChillerRefrigerantInspection;
  oil_analysis?: ChillerOilAnalysis;
  tube_inspections?: ChillerTubeInspection[];
  water_side_inspections?: ChillerWaterSideInspection[];
  water_quality_records?: ChillerWaterQuality[];
  electrical_checks?: ChillerElectricalCheck[];
  performance_test?: ChillerPerformanceTest;
  findings?: ChillerAnnualFinding[];
}

// Reference data collection
export interface ChillerReferenceData {
  riskLevels: ChillerRefRiskLevel[];
  leakLocations: ChillerRefLeakLocation[];
  sightGlassConditions: ChillerRefSightGlassCondition[];
  starterConditions: ChillerRefStarterCondition[];
  issueCodes: ChillerRefIssueCode[];
  tubeTestMethods: ChillerRefTubeTestMethod[];
}

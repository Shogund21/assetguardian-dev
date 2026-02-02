-- =====================================================
-- ANNUAL CHILLER MAINTENANCE & RISK INTELLIGENCE MODULE
-- =====================================================
-- This creates a completely separate system for annual chiller inspections
-- that runs alongside (not replacing) the existing maintenance system.
-- =====================================================

-- =====================================================
-- REFERENCE TABLES (6 Total)
-- =====================================================

-- 1. Leak Locations Reference
CREATE TABLE public.chiller_ref_leak_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  category text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Sight Glass Conditions Reference
CREATE TABLE public.chiller_ref_sight_glass_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  severity_score int CHECK (severity_score >= 1 AND severity_score <= 5),
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Starter Conditions Reference
CREATE TABLE public.chiller_ref_starter_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  risk_score int CHECK (risk_score >= 1 AND risk_score <= 10),
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Risk Levels Reference
CREATE TABLE public.chiller_ref_risk_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  color_hex text,
  priority_weight int DEFAULT 0,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Issue Codes Reference
CREATE TABLE public.chiller_ref_issue_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  category text NOT NULL,
  label text NOT NULL,
  description text,
  recommended_action text,
  default_risk_level text REFERENCES public.chiller_ref_risk_levels(code),
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Tube Test Methods Reference
CREATE TABLE public.chiller_ref_tube_test_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- SEED REFERENCE DATA
-- =====================================================

-- Seed Risk Levels
INSERT INTO public.chiller_ref_risk_levels (code, label, color_hex, priority_weight, sort_order) VALUES
  ('none', 'None', '#10B981', 0, 1),
  ('low', 'Low', '#3B82F6', 1, 2),
  ('medium', 'Medium', '#F59E0B', 2, 3),
  ('high', 'High', '#EF4444', 3, 4),
  ('critical', 'Critical', '#7C3AED', 4, 5);

-- Seed Leak Locations
INSERT INTO public.chiller_ref_leak_locations (code, label, category, sort_order) VALUES
  ('shaft_seal', 'Shaft Seal', 'compressor', 1),
  ('suction_flange', 'Suction Flange', 'compressor', 2),
  ('discharge_flange', 'Discharge Flange', 'compressor', 3),
  ('oil_drain', 'Oil Drain', 'compressor', 4),
  ('relief_valve', 'Relief Valve', 'valve', 5),
  ('sight_glass', 'Sight Glass', 'compressor', 6),
  ('motor_terminal', 'Motor Terminal Box', 'compressor', 7),
  ('service_valve', 'Service Valve', 'valve', 8),
  ('evaporator_tube', 'Evaporator Tube', 'heat_exchanger', 9),
  ('condenser_tube', 'Condenser Tube', 'heat_exchanger', 10),
  ('piping_joint', 'Piping Joint', 'piping', 11),
  ('flare_fitting', 'Flare Fitting', 'piping', 12),
  ('brazed_joint', 'Brazed Joint', 'piping', 13),
  ('purge_unit', 'Purge Unit', 'accessories', 14),
  ('other', 'Other', 'other', 99);

-- Seed Sight Glass Conditions
INSERT INTO public.chiller_ref_sight_glass_conditions (code, label, severity_score, sort_order) VALUES
  ('clear', 'Clear - Normal', 1, 1),
  ('bubbles_minor', 'Minor Bubbles', 2, 2),
  ('bubbles_heavy', 'Heavy Bubbles', 3, 3),
  ('moisture_present', 'Moisture Present', 4, 4),
  ('discolored', 'Discolored/Contaminated', 5, 5),
  ('oil_contaminated', 'Oil Contaminated', 4, 6);

-- Seed Starter Conditions
INSERT INTO public.chiller_ref_starter_conditions (code, label, risk_score, sort_order) VALUES
  ('operational', 'Operational - Good', 1, 1),
  ('minor_wear', 'Minor Wear', 3, 2),
  ('worn_contacts', 'Worn Contacts', 5, 3),
  ('overheating', 'Signs of Overheating', 7, 4),
  ('arc_damage', 'Arc Damage Present', 8, 5),
  ('replacement_recommended', 'Replacement Recommended', 9, 6),
  ('failed', 'Failed', 10, 7);

-- Seed Tube Test Methods
INSERT INTO public.chiller_ref_tube_test_methods (code, label, sort_order) VALUES
  ('eddy_current', 'Eddy Current Test', 1),
  ('ultrasonic', 'Ultrasonic Test', 2),
  ('visual', 'Visual Inspection', 3),
  ('pressure_test', 'Pressure/Leak Test', 4),
  ('dye_penetrant', 'Dye Penetrant Test', 5),
  ('borescope', 'Borescope Inspection', 6);

-- Seed Issue Codes
INSERT INTO public.chiller_ref_issue_codes (code, category, label, description, recommended_action, default_risk_level, sort_order) VALUES
  ('REF001', 'refrigerant', 'Low Refrigerant Charge', 'Refrigerant charge below nameplate specification', 'Locate and repair leak, recharge system', 'high', 1),
  ('REF002', 'refrigerant', 'Refrigerant Leak Detected', 'Active refrigerant leak found during inspection', 'Repair leak source immediately', 'critical', 2),
  ('REF003', 'refrigerant', 'High Acid Level', 'Acid test indicates contamination', 'Perform acid removal, consider oil change', 'high', 3),
  ('REF004', 'refrigerant', 'Moisture in System', 'Sight glass indicates moisture contamination', 'Replace filter drier, evacuate and recharge', 'high', 4),
  ('OIL001', 'oil', 'Low Oil Level', 'Oil level below minimum operating range', 'Add oil, check for leaks', 'medium', 10),
  ('OIL002', 'oil', 'High Acid Number', 'Oil acid number exceeds acceptable limits', 'Change oil, investigate cause', 'high', 11),
  ('OIL003', 'oil', 'Excessive Wear Metals', 'Metal particles in oil exceed normal levels', 'Investigate bearing/compressor wear', 'high', 12),
  ('OIL004', 'oil', 'Oil Contamination', 'Oil appearance indicates contamination', 'Change oil, replace filters', 'medium', 13),
  ('TUBE001', 'tubes', 'Tube Fouling', 'Heat exchanger tubes show excessive fouling', 'Clean tubes, review water treatment', 'medium', 20),
  ('TUBE002', 'tubes', 'Tube Wall Thinning', 'Tube wall thickness below safe operating limits', 'Monitor closely, plan replacement', 'high', 21),
  ('TUBE003', 'tubes', 'Plugged Tubes', 'Excessive number of plugged tubes', 'Consider tube replacement or retubing', 'high', 22),
  ('TUBE004', 'tubes', 'Tube Leak', 'Leak detected in heat exchanger tubes', 'Plug or replace affected tubes', 'critical', 23),
  ('WTR001', 'water', 'Low Flow Rate', 'Water flow below design specification', 'Check pumps, strainers, valves', 'medium', 30),
  ('WTR002', 'water', 'High Delta-T', 'Temperature differential exceeds design', 'Check flow rate, capacity issues', 'medium', 31),
  ('WTR003', 'water', 'Poor Water Quality', 'Water chemistry outside treatment limits', 'Adjust water treatment program', 'medium', 32),
  ('WTR004', 'water', 'Legionella Risk', 'Bacteria counts or conditions indicate risk', 'Emergency water treatment, review program', 'critical', 33),
  ('ELEC001', 'electrical', 'Voltage Imbalance', 'Phase voltage imbalance exceeds 2%', 'Investigate power supply, contact utility', 'medium', 40),
  ('ELEC002', 'electrical', 'High Motor Amps', 'Motor amperage exceeds nameplate', 'Check load, motor condition', 'high', 41),
  ('ELEC003', 'electrical', 'Low Insulation Resistance', 'Megger test shows degraded insulation', 'Plan motor rewind or replacement', 'high', 42),
  ('ELEC004', 'electrical', 'Starter Degradation', 'Starter components show wear or damage', 'Replace contacts or starter', 'medium', 43),
  ('PERF001', 'performance', 'Reduced Capacity', 'Chiller not meeting design tonnage', 'Diagnose cause, repair as needed', 'high', 50),
  ('PERF002', 'performance', 'Poor Efficiency', 'kW/ton exceeds design by >15%', 'Tune up, clean, address issues', 'medium', 51),
  ('PERF003', 'performance', 'High Approach Temps', 'Approach temperatures indicate fouling', 'Clean heat exchangers', 'medium', 52),
  ('SAFE001', 'safety', 'Safety Device Malfunction', 'Safety switch or sensor not working', 'Repair or replace immediately', 'critical', 60),
  ('SAFE002', 'safety', 'Vibration Excessive', 'Vibration levels indicate mechanical issue', 'Investigate bearings, alignment', 'high', 61);

-- =====================================================
-- MAIN TABLES (10 Total)
-- =====================================================

-- 1. Annual Chiller PM (Parent Record)
CREATE TABLE public.annual_chiller_pm (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id),
  location_id uuid REFERENCES public.locations(id),
  technician_id uuid REFERENCES public.technicians(id),
  inspection_year int NOT NULL,
  inspection_date timestamptz NOT NULL,
  scheduled_date date,
  chiller_model text,
  chiller_serial text,
  chiller_age_years numeric(4,1),
  operating_hours_at_inspection int,
  status text DEFAULT 'in_progress' CHECK (status IN ('draft', 'in_progress', 'pending_review', 'completed', 'cancelled')),
  overall_risk_level text REFERENCES public.chiller_ref_risk_levels(code),
  overall_risk_score numeric(5,2) CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  requires_immediate_action boolean DEFAULT false,
  next_annual_due date,
  completion_date timestamptz,
  reviewed_by uuid REFERENCES public.technicians(id),
  reviewed_at timestamptz,
  labor_hours_total numeric(6,2),
  parts_cost_total numeric(10,2),
  labor_cost_total numeric(10,2),
  notes text,
  ai_analysis_json jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(equipment_id, inspection_year)
);

-- 2. Refrigerant Inspection
CREATE TABLE public.chiller_refrigerant_inspection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_pm_id uuid NOT NULL REFERENCES public.annual_chiller_pm(id) ON DELETE CASCADE,
  refrigerant_type text,
  charge_lbs numeric(8,2),
  nameplate_charge_lbs numeric(8,2),
  charge_variance_pct numeric(5,2),
  leak_detected boolean DEFAULT false,
  leak_location_code text REFERENCES public.chiller_ref_leak_locations(code),
  leak_rate_oz_year numeric(6,2),
  recovery_amount_lbs numeric(8,2),
  added_amount_lbs numeric(8,2),
  suction_pressure_psig numeric(6,2),
  discharge_pressure_psig numeric(6,2),
  subcooling_f numeric(5,2),
  superheat_f numeric(5,2),
  sight_glass_condition text REFERENCES public.chiller_ref_sight_glass_conditions(code),
  moisture_indicator_color text,
  acid_test_passed boolean,
  acid_ppm numeric(6,2),
  non_condensable_test_passed boolean,
  purge_unit_hours numeric(8,1),
  purge_unit_cycles int,
  drier_replaced boolean DEFAULT false,
  drier_moisture_ppm numeric(6,2),
  risk_level text REFERENCES public.chiller_ref_risk_levels(code),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Oil Analysis
CREATE TABLE public.chiller_oil_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_pm_id uuid NOT NULL REFERENCES public.annual_chiller_pm(id) ON DELETE CASCADE,
  oil_type text,
  oil_capacity_gallons numeric(6,2),
  current_level_pct numeric(5,2) CHECK (current_level_pct >= 0 AND current_level_pct <= 100),
  oil_changed boolean DEFAULT false,
  oil_added_gallons numeric(5,2),
  sample_collected boolean DEFAULT false,
  sample_lab_id text,
  sample_date date,
  viscosity_cst_40c numeric(8,2),
  viscosity_cst_100c numeric(8,2),
  acid_number_mgkoh_g numeric(6,3),
  moisture_ppm numeric(6,1),
  iron_ppm numeric(6,1),
  copper_ppm numeric(6,1),
  aluminum_ppm numeric(6,1),
  silicon_ppm numeric(6,1),
  tin_ppm numeric(6,1),
  lead_ppm numeric(6,1),
  oxidation_number numeric(6,2),
  dielectric_strength_kv numeric(6,2),
  foam_test_passed boolean,
  appearance text,
  oil_heater_functional boolean,
  oil_pump_pressure_psig numeric(6,2),
  oil_filter_replaced boolean DEFAULT false,
  oil_filter_dp_psig numeric(5,2),
  risk_level text REFERENCES public.chiller_ref_risk_levels(code),
  lab_recommendations text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Tube Inspection
CREATE TABLE public.chiller_tube_inspection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_pm_id uuid NOT NULL REFERENCES public.annual_chiller_pm(id) ON DELETE CASCADE,
  bundle_type text NOT NULL CHECK (bundle_type IN ('evaporator', 'condenser')),
  tube_count_total int,
  test_method text REFERENCES public.chiller_ref_tube_test_methods(code),
  tubes_tested_count int,
  tubes_tested_pct numeric(5,2),
  tubes_plugged_previous int,
  tubes_plugged_new int,
  tubes_plugged_total int,
  plugged_pct numeric(5,2),
  tubes_with_pitting int,
  tubes_with_thinning int,
  min_wall_thickness_mils numeric(5,1),
  avg_wall_thickness_mils numeric(5,1),
  original_wall_thickness_mils numeric(5,1),
  wall_loss_pct numeric(5,2),
  fouling_factor_measured numeric(8,5),
  fouling_factor_design numeric(8,5),
  fouling_severity text CHECK (fouling_severity IN ('none', 'light', 'moderate', 'heavy', 'severe')),
  fouling_type text,
  tubes_cleaned boolean DEFAULT false,
  cleaning_method text,
  approach_temp_before_f numeric(5,2),
  approach_temp_after_f numeric(5,2),
  waterbox_condition text,
  waterbox_gaskets_replaced boolean DEFAULT false,
  tube_sheet_condition text,
  sacrificial_anodes_replaced boolean,
  anode_depletion_pct numeric(5,2),
  estimated_remaining_life_years numeric(4,1),
  risk_level text REFERENCES public.chiller_ref_risk_levels(code),
  next_test_recommended date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Water Side Inspection
CREATE TABLE public.chiller_water_side_inspection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_pm_id uuid NOT NULL REFERENCES public.annual_chiller_pm(id) ON DELETE CASCADE,
  water_loop text NOT NULL CHECK (water_loop IN ('chilled_water', 'condenser_water')),
  entering_water_temp_f numeric(5,2),
  leaving_water_temp_f numeric(5,2),
  delta_t_f numeric(5,2),
  design_delta_t_f numeric(5,2),
  flow_rate_gpm numeric(8,2),
  design_flow_gpm numeric(8,2),
  flow_variance_pct numeric(5,2),
  pressure_drop_psig numeric(6,2),
  design_pressure_drop_psig numeric(6,2),
  pump_suction_pressure_psig numeric(6,2),
  pump_discharge_pressure_psig numeric(6,2),
  strainer_cleaned boolean DEFAULT false,
  strainer_dp_psig numeric(5,2),
  valve_operation_checked boolean DEFAULT false,
  isolation_valves_condition text,
  expansion_tank_level_pct numeric(5,2),
  air_separator_functional boolean,
  glycol_concentration_pct numeric(5,2),
  risk_level text REFERENCES public.chiller_ref_risk_levels(code),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Water Quality
CREATE TABLE public.chiller_water_quality (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_pm_id uuid NOT NULL REFERENCES public.annual_chiller_pm(id) ON DELETE CASCADE,
  water_loop text NOT NULL CHECK (water_loop IN ('chilled_water', 'condenser_water', 'makeup')),
  sample_date date,
  sample_location text,
  ph numeric(4,2),
  conductivity_umhos numeric(8,1),
  total_dissolved_solids_ppm numeric(8,1),
  hardness_ppm_caco3 numeric(8,1),
  alkalinity_ppm numeric(8,1),
  chlorides_ppm numeric(8,1),
  sulfates_ppm numeric(8,1),
  silica_ppm numeric(8,1),
  iron_ppm numeric(6,2),
  copper_ppm numeric(6,2),
  bacteria_count_cfu_ml numeric(10,0),
  legionella_detected boolean,
  legionella_cfu_l numeric(10,0),
  biocide_residual_ppm numeric(6,2),
  inhibitor_residual_ppm numeric(6,2),
  cycles_of_concentration numeric(5,2),
  langelier_saturation_index numeric(4,2),
  ryznar_stability_index numeric(4,2),
  within_spec boolean,
  treatment_vendor text,
  risk_level text REFERENCES public.chiller_ref_risk_levels(code),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Electrical Check
CREATE TABLE public.chiller_electrical_check (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_pm_id uuid NOT NULL REFERENCES public.annual_chiller_pm(id) ON DELETE CASCADE,
  component text NOT NULL CHECK (component IN ('main_motor', 'oil_pump', 'purge', 'controls', 'vfd')),
  voltage_l1_l2 numeric(6,1),
  voltage_l2_l3 numeric(6,1),
  voltage_l3_l1 numeric(6,1),
  voltage_imbalance_pct numeric(5,2),
  amperage_l1 numeric(7,2),
  amperage_l2 numeric(7,2),
  amperage_l3 numeric(7,2),
  amperage_imbalance_pct numeric(5,2),
  nameplate_fla numeric(7,2),
  current_pct_fla numeric(5,2),
  power_factor numeric(4,2),
  kw_measured numeric(8,2),
  insulation_resistance_megohms numeric(8,2),
  winding_temp_f numeric(5,1),
  bearing_temp_drive_end_f numeric(5,1),
  bearing_temp_non_drive_f numeric(5,1),
  vibration_ips_de numeric(6,3),
  vibration_ips_nde numeric(6,3),
  vibration_acceptable boolean,
  starter_condition text REFERENCES public.chiller_ref_starter_conditions(code),
  contactor_condition text,
  overload_setting_amps numeric(7,2),
  overload_functional boolean,
  control_wiring_condition text,
  terminal_connections_tight boolean,
  vfd_fault_history_cleared boolean,
  vfd_firmware_version text,
  risk_level text REFERENCES public.chiller_ref_risk_levels(code),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Performance Test
CREATE TABLE public.chiller_performance_test (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_pm_id uuid NOT NULL REFERENCES public.annual_chiller_pm(id) ON DELETE CASCADE,
  test_date timestamptz,
  test_duration_minutes int,
  load_pct numeric(5,2),
  chilled_water_supply_f numeric(5,2),
  chilled_water_return_f numeric(5,2),
  chw_delta_t_f numeric(5,2),
  chw_flow_gpm numeric(8,2),
  condenser_water_supply_f numeric(5,2),
  condenser_water_return_f numeric(5,2),
  cw_delta_t_f numeric(5,2),
  cw_flow_gpm numeric(8,2),
  evaporator_sat_temp_f numeric(5,2),
  condenser_sat_temp_f numeric(5,2),
  evaporator_approach_f numeric(5,2),
  condenser_approach_f numeric(5,2),
  suction_pressure_psig numeric(6,2),
  discharge_pressure_psig numeric(6,2),
  lift_psig numeric(6,2),
  oil_pressure_psig numeric(6,2),
  motor_amps numeric(7,2),
  kw_input numeric(8,2),
  tons_actual numeric(8,2),
  tons_design numeric(8,2),
  capacity_pct numeric(5,2),
  kw_per_ton numeric(6,3),
  design_kw_per_ton numeric(6,3),
  efficiency_variance_pct numeric(6,2),
  cop numeric(5,2),
  iplv numeric(5,2),
  nplv numeric(5,2),
  guide_vane_position_pct numeric(5,2),
  slide_valve_position_pct numeric(5,2),
  meets_design_capacity boolean,
  meets_design_efficiency boolean,
  degradation_since_last_year_pct numeric(5,2),
  risk_level text REFERENCES public.chiller_ref_risk_levels(code),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. Annual Findings
CREATE TABLE public.chiller_annual_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_pm_id uuid NOT NULL REFERENCES public.annual_chiller_pm(id) ON DELETE CASCADE,
  finding_number int,
  issue_code text REFERENCES public.chiller_ref_issue_codes(code),
  category text,
  description text NOT NULL,
  location_detail text,
  severity text NOT NULL REFERENCES public.chiller_ref_risk_levels(code),
  is_repeat_finding boolean DEFAULT false,
  prior_finding_id uuid REFERENCES public.chiller_annual_findings(id),
  recommended_action text,
  action_taken text,
  action_date date,
  parts_required text[],
  estimated_cost numeric(10,2),
  actual_cost numeric(10,2),
  responsible_party text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'deferred', 'wont_fix')),
  resolution_date date,
  resolution_notes text,
  requires_follow_up boolean DEFAULT false,
  follow_up_date date,
  ai_confidence_score numeric(5,2),
  ai_recommendation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. Finding Attachments
CREATE TABLE public.chiller_finding_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid NOT NULL REFERENCES public.chiller_annual_findings(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size_bytes int,
  mime_type text,
  is_primary boolean DEFAULT false,
  caption text,
  taken_at timestamptz,
  gps_latitude numeric(10,7),
  gps_longitude numeric(10,7),
  uploaded_by uuid REFERENCES public.technicians(id),
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_annual_pm_equipment_year ON public.annual_chiller_pm(equipment_id, inspection_year);
CREATE INDEX idx_annual_pm_company ON public.annual_chiller_pm(company_id);
CREATE INDEX idx_annual_pm_date ON public.annual_chiller_pm(inspection_date);
CREATE INDEX idx_annual_pm_risk ON public.annual_chiller_pm(overall_risk_level);
CREATE INDEX idx_annual_pm_status ON public.annual_chiller_pm(status);

CREATE INDEX idx_refrigerant_insp_pm ON public.chiller_refrigerant_inspection(annual_pm_id);
CREATE INDEX idx_oil_analysis_pm ON public.chiller_oil_analysis(annual_pm_id);
CREATE INDEX idx_tube_insp_pm ON public.chiller_tube_inspection(annual_pm_id);
CREATE INDEX idx_water_side_pm ON public.chiller_water_side_inspection(annual_pm_id);
CREATE INDEX idx_water_quality_pm ON public.chiller_water_quality(annual_pm_id);
CREATE INDEX idx_electrical_pm ON public.chiller_electrical_check(annual_pm_id);
CREATE INDEX idx_performance_pm ON public.chiller_performance_test(annual_pm_id);

CREATE INDEX idx_findings_pm ON public.chiller_annual_findings(annual_pm_id);
CREATE INDEX idx_findings_code ON public.chiller_annual_findings(issue_code);
CREATE INDEX idx_findings_status ON public.chiller_annual_findings(status);
CREATE INDEX idx_findings_severity ON public.chiller_annual_findings(severity);

CREATE INDEX idx_attachments_finding ON public.chiller_finding_attachments(finding_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.chiller_ref_leak_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_ref_sight_glass_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_ref_starter_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_ref_risk_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_ref_issue_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_ref_tube_test_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_chiller_pm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_refrigerant_inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_oil_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_tube_inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_water_side_inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_water_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_electrical_check ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_performance_test ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_annual_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chiller_finding_attachments ENABLE ROW LEVEL SECURITY;

-- Reference tables - readable by all authenticated users
CREATE POLICY "Reference tables are readable by authenticated users" ON public.chiller_ref_leak_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reference tables are readable by authenticated users" ON public.chiller_ref_sight_glass_conditions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reference tables are readable by authenticated users" ON public.chiller_ref_starter_conditions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reference tables are readable by authenticated users" ON public.chiller_ref_risk_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reference tables are readable by authenticated users" ON public.chiller_ref_issue_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reference tables are readable by authenticated users" ON public.chiller_ref_tube_test_methods FOR SELECT TO authenticated USING (true);

-- Annual PM policies - company scoped using existing helper functions
CREATE POLICY "Users can view their company annual PMs" ON public.annual_chiller_pm
  FOR SELECT USING (company_id IS NULL OR is_member_of(company_id) OR can_access_all_data());

CREATE POLICY "Users can insert annual PMs for their company" ON public.annual_chiller_pm
  FOR INSERT WITH CHECK (company_id IS NULL OR is_member_of(company_id) OR can_access_all_data());

CREATE POLICY "Users can update their company annual PMs" ON public.annual_chiller_pm
  FOR UPDATE USING (company_id IS NULL OR is_member_of(company_id) OR can_access_all_data());

CREATE POLICY "Users can delete their company annual PMs" ON public.annual_chiller_pm
  FOR DELETE USING (company_id IS NULL OR is_member_of(company_id) OR can_access_all_data());

-- Child table policies - access through parent
CREATE POLICY "Access refrigerant inspection through parent" ON public.chiller_refrigerant_inspection
  FOR ALL USING (EXISTS (SELECT 1 FROM public.annual_chiller_pm p WHERE p.id = annual_pm_id AND (p.company_id IS NULL OR is_member_of(p.company_id) OR can_access_all_data())));

CREATE POLICY "Access oil analysis through parent" ON public.chiller_oil_analysis
  FOR ALL USING (EXISTS (SELECT 1 FROM public.annual_chiller_pm p WHERE p.id = annual_pm_id AND (p.company_id IS NULL OR is_member_of(p.company_id) OR can_access_all_data())));

CREATE POLICY "Access tube inspection through parent" ON public.chiller_tube_inspection
  FOR ALL USING (EXISTS (SELECT 1 FROM public.annual_chiller_pm p WHERE p.id = annual_pm_id AND (p.company_id IS NULL OR is_member_of(p.company_id) OR can_access_all_data())));

CREATE POLICY "Access water side inspection through parent" ON public.chiller_water_side_inspection
  FOR ALL USING (EXISTS (SELECT 1 FROM public.annual_chiller_pm p WHERE p.id = annual_pm_id AND (p.company_id IS NULL OR is_member_of(p.company_id) OR can_access_all_data())));

CREATE POLICY "Access water quality through parent" ON public.chiller_water_quality
  FOR ALL USING (EXISTS (SELECT 1 FROM public.annual_chiller_pm p WHERE p.id = annual_pm_id AND (p.company_id IS NULL OR is_member_of(p.company_id) OR can_access_all_data())));

CREATE POLICY "Access electrical check through parent" ON public.chiller_electrical_check
  FOR ALL USING (EXISTS (SELECT 1 FROM public.annual_chiller_pm p WHERE p.id = annual_pm_id AND (p.company_id IS NULL OR is_member_of(p.company_id) OR can_access_all_data())));

CREATE POLICY "Access performance test through parent" ON public.chiller_performance_test
  FOR ALL USING (EXISTS (SELECT 1 FROM public.annual_chiller_pm p WHERE p.id = annual_pm_id AND (p.company_id IS NULL OR is_member_of(p.company_id) OR can_access_all_data())));

CREATE POLICY "Access findings through parent" ON public.chiller_annual_findings
  FOR ALL USING (EXISTS (SELECT 1 FROM public.annual_chiller_pm p WHERE p.id = annual_pm_id AND (p.company_id IS NULL OR is_member_of(p.company_id) OR can_access_all_data())));

CREATE POLICY "Access attachments through finding" ON public.chiller_finding_attachments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.chiller_annual_findings f 
    JOIN public.annual_chiller_pm p ON p.id = f.annual_pm_id 
    WHERE f.id = finding_id AND (p.company_id IS NULL OR is_member_of(p.company_id) OR can_access_all_data())
  ));

-- =====================================================
-- STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('chiller-annual-attachments', 'chiller-annual-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can view chiller attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'chiller-annual-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload chiller attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chiller-annual-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update chiller attachments" ON storage.objects
  FOR UPDATE USING (bucket_id = 'chiller-annual-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete chiller attachments" ON storage.objects
  FOR DELETE USING (bucket_id = 'chiller-annual-attachments' AND auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_chiller_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_annual_chiller_pm_updated_at BEFORE UPDATE ON public.annual_chiller_pm FOR EACH ROW EXECUTE FUNCTION update_chiller_updated_at();
CREATE TRIGGER update_chiller_refrigerant_inspection_updated_at BEFORE UPDATE ON public.chiller_refrigerant_inspection FOR EACH ROW EXECUTE FUNCTION update_chiller_updated_at();
CREATE TRIGGER update_chiller_oil_analysis_updated_at BEFORE UPDATE ON public.chiller_oil_analysis FOR EACH ROW EXECUTE FUNCTION update_chiller_updated_at();
CREATE TRIGGER update_chiller_tube_inspection_updated_at BEFORE UPDATE ON public.chiller_tube_inspection FOR EACH ROW EXECUTE FUNCTION update_chiller_updated_at();
CREATE TRIGGER update_chiller_water_side_inspection_updated_at BEFORE UPDATE ON public.chiller_water_side_inspection FOR EACH ROW EXECUTE FUNCTION update_chiller_updated_at();
CREATE TRIGGER update_chiller_water_quality_updated_at BEFORE UPDATE ON public.chiller_water_quality FOR EACH ROW EXECUTE FUNCTION update_chiller_updated_at();
CREATE TRIGGER update_chiller_electrical_check_updated_at BEFORE UPDATE ON public.chiller_electrical_check FOR EACH ROW EXECUTE FUNCTION update_chiller_updated_at();
CREATE TRIGGER update_chiller_performance_test_updated_at BEFORE UPDATE ON public.chiller_performance_test FOR EACH ROW EXECUTE FUNCTION update_chiller_updated_at();
CREATE TRIGGER update_chiller_annual_findings_updated_at BEFORE UPDATE ON public.chiller_annual_findings FOR EACH ROW EXECUTE FUNCTION update_chiller_updated_at();
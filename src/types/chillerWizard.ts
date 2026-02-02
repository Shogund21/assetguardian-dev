// Types for Chiller Inspection Wizard

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SkipReasonCode = 
  | 'not_applicable' 
  | 'deferred' 
  | 'access_issue' 
  | 'equipment_not_running'
  | 'other';

export interface SkipReason {
  step: WizardStep;
  reasonCode: SkipReasonCode;
  notes?: string;
}

export interface WizardStepInfo {
  step: WizardStep;
  title: string;
  shortTitle: string;
  canSkip: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  skipReason?: SkipReason;
}

export interface ChillerWizardFormData {
  // Step 1: Asset Selection
  equipment_id: string | null;
  inspection_date: string;
  technician_id: string | null;
  operating_hours_at_inspection: number | null;
  chiller_model: string | null;
  chiller_serial: string | null;
  
  // Step 2: Refrigerant
  refrigerant: {
    leak_detected: boolean | null;
    leak_location_code: string | null;
    sight_glass_condition: string | null;
    moisture_indicator_color: string | null;
    refrigerant_type: string | null;
    charge_lbs: number | null;
    nameplate_charge_lbs: number | null;
    suction_pressure_psig: number | null;
    discharge_pressure_psig: number | null;
    acid_test_passed: boolean | null;
    subcooling_f: number | null;
    superheat_f: number | null;
    drier_replaced: boolean;
    notes: string | null;
  };
  
  // Step 3: Oil System
  oil: {
    current_level_pct: number | null;
    oil_type: string | null;
    appearance: string | null;
    sample_collected: boolean;
    acid_number_mgkoh_g: number | null;
    moisture_ppm: number | null;
    iron_ppm: number | null;
    copper_ppm: number | null;
    aluminum_ppm: number | null;
    oil_changed: boolean;
    oil_filter_replaced: boolean;
    oil_heater_functional: boolean | null;
    oil_pump_pressure_psig: number | null;
    notes: string | null;
  };
  
  // Step 4: Tube Inspection (both evaporator and condenser)
  tubes: {
    evaporator: TubeInspectionData;
    condenser: TubeInspectionData;
  };
  
  // Step 5: Water Side & Quality
  water: {
    chilled_water: WaterSideData;
    condenser_water: WaterSideData;
    quality: WaterQualityData;
  };
  
  // Step 6: Electrical
  electrical: {
    main_motor: ElectricalCheckData;
    oil_pump?: ElectricalCheckData;
    vfd?: ElectricalCheckData;
  };
  
  // Step 7: Performance
  performance: {
    test_date: string | null;
    load_pct: number | null;
    chilled_water_supply_f: number | null;
    chilled_water_return_f: number | null;
    condenser_water_supply_f: number | null;
    condenser_water_return_f: number | null;
    chw_flow_gpm: number | null;
    kw_input: number | null;
    tons_actual: number | null;
    tons_design: number | null;
    kw_per_ton: number | null;
    design_kw_per_ton: number | null;
    notes: string | null;
  };
  
  // Step 8: Findings
  findings: FindingData[];
  
  // Metadata
  skipReasons: Record<number, SkipReason>;
  completedSteps: WizardStep[];
}

export interface TubeInspectionData {
  tube_count_total: number | null;
  tubes_plugged_total: number | null;
  plugged_pct: number | null;
  test_method: string | null;
  min_wall_thickness_mils: number | null;
  avg_wall_thickness_mils: number | null;
  original_wall_thickness_mils: number | null;
  wall_loss_pct: number | null;
  fouling_severity: string | null;
  tubes_cleaned: boolean;
  cleaning_method: string | null;
  waterbox_condition: string | null;
  waterbox_gaskets_replaced: boolean;
  sacrificial_anodes_replaced: boolean | null;
  notes: string | null;
}

export interface WaterSideData {
  entering_water_temp_f: number | null;
  leaving_water_temp_f: number | null;
  delta_t_f: number | null;
  flow_rate_gpm: number | null;
  design_flow_gpm: number | null;
  strainer_cleaned: boolean;
  notes: string | null;
}

export interface WaterQualityData {
  water_loop: string;
  ph: number | null;
  conductivity_umhos: number | null;
  total_dissolved_solids_ppm: number | null;
  legionella_detected: boolean | null;
  within_spec: boolean | null;
  treatment_vendor: string | null;
  notes: string | null;
}

export interface ElectricalCheckData {
  voltage_l1_l2: number | null;
  voltage_l2_l3: number | null;
  voltage_l3_l1: number | null;
  voltage_imbalance_pct: number | null;
  amperage_l1: number | null;
  amperage_l2: number | null;
  amperage_l3: number | null;
  insulation_resistance_megohms: number | null;
  vibration_acceptable: boolean | null;
  starter_condition: string | null;
  notes: string | null;
}

export interface FindingData {
  id: string;
  issue_code: string | null;
  category: string | null;
  description: string;
  severity: string;
  recommended_action: string | null;
  photos: PhotoData[];
  is_auto_generated: boolean;
}

export interface PhotoData {
  id: string;
  blob?: Blob;
  url?: string;
  caption: string | null;
  is_primary: boolean;
  synced: boolean;
}

// Initial empty form data
export const getInitialWizardFormData = (): ChillerWizardFormData => ({
  equipment_id: null,
  inspection_date: new Date().toISOString().split('T')[0],
  technician_id: null,
  operating_hours_at_inspection: null,
  chiller_model: null,
  chiller_serial: null,
  
  refrigerant: {
    leak_detected: null,
    leak_location_code: null,
    sight_glass_condition: null,
    moisture_indicator_color: null,
    refrigerant_type: null,
    charge_lbs: null,
    nameplate_charge_lbs: null,
    suction_pressure_psig: null,
    discharge_pressure_psig: null,
    acid_test_passed: null,
    subcooling_f: null,
    superheat_f: null,
    drier_replaced: false,
    notes: null,
  },
  
  oil: {
    current_level_pct: null,
    oil_type: null,
    appearance: null,
    sample_collected: false,
    acid_number_mgkoh_g: null,
    moisture_ppm: null,
    iron_ppm: null,
    copper_ppm: null,
    aluminum_ppm: null,
    oil_changed: false,
    oil_filter_replaced: false,
    oil_heater_functional: null,
    oil_pump_pressure_psig: null,
    notes: null,
  },
  
  tubes: {
    evaporator: getEmptyTubeData(),
    condenser: getEmptyTubeData(),
  },
  
  water: {
    chilled_water: getEmptyWaterSideData(),
    condenser_water: getEmptyWaterSideData(),
    quality: {
      water_loop: 'condenser_water',
      ph: null,
      conductivity_umhos: null,
      total_dissolved_solids_ppm: null,
      legionella_detected: null,
      within_spec: null,
      treatment_vendor: null,
      notes: null,
    },
  },
  
  electrical: {
    main_motor: getEmptyElectricalData(),
  },
  
  performance: {
    test_date: null,
    load_pct: null,
    chilled_water_supply_f: null,
    chilled_water_return_f: null,
    condenser_water_supply_f: null,
    condenser_water_return_f: null,
    chw_flow_gpm: null,
    kw_input: null,
    tons_actual: null,
    tons_design: null,
    kw_per_ton: null,
    design_kw_per_ton: null,
    notes: null,
  },
  
  findings: [],
  skipReasons: {},
  completedSteps: [],
});

export const getEmptyTubeData = (): TubeInspectionData => ({
  tube_count_total: null,
  tubes_plugged_total: null,
  plugged_pct: null,
  test_method: null,
  min_wall_thickness_mils: null,
  avg_wall_thickness_mils: null,
  original_wall_thickness_mils: null,
  wall_loss_pct: null,
  fouling_severity: null,
  tubes_cleaned: false,
  cleaning_method: null,
  waterbox_condition: null,
  waterbox_gaskets_replaced: false,
  sacrificial_anodes_replaced: null,
  notes: null,
});

export const getEmptyWaterSideData = (): WaterSideData => ({
  entering_water_temp_f: null,
  leaving_water_temp_f: null,
  delta_t_f: null,
  flow_rate_gpm: null,
  design_flow_gpm: null,
  strainer_cleaned: false,
  notes: null,
});

export const getEmptyElectricalData = (): ElectricalCheckData => ({
  voltage_l1_l2: null,
  voltage_l2_l3: null,
  voltage_l3_l1: null,
  voltage_imbalance_pct: null,
  amperage_l1: null,
  amperage_l2: null,
  amperage_l3: null,
  insulation_resistance_megohms: null,
  vibration_acceptable: null,
  starter_condition: null,
  notes: null,
});

export const WIZARD_STEPS: WizardStepInfo[] = [
  { step: 1, title: 'Select Asset', shortTitle: 'Asset', canSkip: false, isCompleted: false, isSkipped: false },
  { step: 2, title: 'Refrigerant Inspection', shortTitle: 'Refrig', canSkip: true, isCompleted: false, isSkipped: false },
  { step: 3, title: 'Oil System', shortTitle: 'Oil', canSkip: true, isCompleted: false, isSkipped: false },
  { step: 4, title: 'Tube Inspection', shortTitle: 'Tubes', canSkip: true, isCompleted: false, isSkipped: false },
  { step: 5, title: 'Water System', shortTitle: 'Water', canSkip: true, isCompleted: false, isSkipped: false },
  { step: 6, title: 'Electrical', shortTitle: 'Elec', canSkip: true, isCompleted: false, isSkipped: false },
  { step: 7, title: 'Performance Test', shortTitle: 'Perf', canSkip: true, isCompleted: false, isSkipped: false },
  { step: 8, title: 'Findings & Photos', shortTitle: 'Findings', canSkip: true, isCompleted: false, isSkipped: false },
  { step: 9, title: 'Review & Submit', shortTitle: 'Review', canSkip: false, isCompleted: false, isSkipped: false },
];

export const SKIP_REASON_OPTIONS = [
  { code: 'not_applicable', label: 'Not Applicable' },
  { code: 'deferred', label: 'Deferred to Follow-up' },
  { code: 'access_issue', label: 'Cannot Access Components' },
  { code: 'equipment_not_running', label: 'Equipment Not Running' },
  { code: 'other', label: 'Other (specify)' },
] as const;

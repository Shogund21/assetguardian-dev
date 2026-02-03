// Sync service for Chiller Annual Inspections - syncs IndexedDB to Supabase

import { supabase } from '@/integrations/supabase/client';
import { ChillerWizardFormData } from '@/types/chillerWizard';
import { chillerOfflineService } from './chillerOfflineService';

interface SyncResult {
  success: boolean;
  pmId?: string;
  error?: string;
}

function calculateRiskScore(formData: ChillerWizardFormData): { score: number; level: string } {
  let score = 0;

  // Refrigerant risks
  if (formData.refrigerant.leak_detected) score += 25;

  // Tube risks (plugged > 5%)
  const evapPlugged = formData.tubes.evaporator.plugged_pct ?? 0;
  const condPlugged = formData.tubes.condenser.plugged_pct ?? 0;
  if (evapPlugged > 5 || condPlugged > 5) score += 30;

  // Tube wall loss > 20%
  const evapWallLoss = formData.tubes.evaporator.wall_loss_pct ?? 0;
  const condWallLoss = formData.tubes.condenser.wall_loss_pct ?? 0;
  if (evapWallLoss > 20 || condWallLoss > 20) score += 25;

  // Oil acid number > 0.05
  if ((formData.oil.acid_number_mgkoh_g ?? 0) > 0.05) score += 30;

  // Electrical risks
  const mainMotor = formData.electrical.main_motor;
  if (mainMotor) {
    // Voltage imbalance > 2%
    if ((mainMotor.voltage_imbalance_pct ?? 0) > 2) score += 20;
    // Insulation resistance < 1 MΩ
    if (mainMotor.insulation_resistance_megohms !== null && mainMotor.insulation_resistance_megohms < 1) score += 20;
  }

  // Water quality risks
  if (formData.water.quality.legionella_detected) score += 40;

  // Determine level
  let level: string;
  if (score <= 30) level = 'low';
  else if (score <= 60) level = 'medium';
  else level = 'high';

  return { score, level };
}

export const chillerSyncService = {
  async syncDraft(draftId: string, companyId: string): Promise<SyncResult> {
    try {
      // Get the draft from IndexedDB
      const draft = await chillerOfflineService.getDraft(draftId);
      if (!draft) {
        return { success: false, error: 'Draft not found in local storage' };
      }

      const formData = draft.form_data;
      
      // Validate required fields
      if (!formData.equipment_id) {
        return { success: false, error: 'Equipment not selected' };
      }

      // Calculate risk score
      const { score: riskScore, level: riskLevel } = calculateRiskScore(formData);

      // Get inspection year from date
      const inspectionYear = new Date(formData.inspection_date).getFullYear();

      // 1. Insert into annual_chiller_pm
      const { data: pmData, error: pmError } = await supabase
        .from('annual_chiller_pm')
        .upsert({
          equipment_id: formData.equipment_id,
          inspection_date: formData.inspection_date,
          inspection_year: inspectionYear,
          technician_id: formData.technician_id,
          company_id: companyId,
          chiller_model: formData.chiller_model,
          chiller_serial: formData.chiller_serial,
          operating_hours_at_inspection: formData.operating_hours_at_inspection,
          overall_risk_score: riskScore,
          overall_risk_level: riskLevel,
          status: 'completed',
          completion_date: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (pmError) {
        console.error('Error inserting annual_chiller_pm:', pmError);
        return { success: false, error: `Database error: ${pmError.message}` };
      }

      const pmId = pmData.id;

      // 2. Insert refrigerant inspection data
      if (formData.refrigerant.leak_detected !== null) {
        const { error: refError } = await supabase
          .from('chiller_refrigerant_inspection')
          .upsert({
            annual_pm_id: pmId,
            leak_detected: formData.refrigerant.leak_detected,
            leak_location_code: formData.refrigerant.leak_location_code,
            sight_glass_condition: formData.refrigerant.sight_glass_condition,
            moisture_indicator_color: formData.refrigerant.moisture_indicator_color,
            refrigerant_type: formData.refrigerant.refrigerant_type,
            charge_lbs: formData.refrigerant.charge_lbs,
            nameplate_charge_lbs: formData.refrigerant.nameplate_charge_lbs,
            suction_pressure_psig: formData.refrigerant.suction_pressure_psig,
            discharge_pressure_psig: formData.refrigerant.discharge_pressure_psig,
            acid_test_passed: formData.refrigerant.acid_test_passed,
            subcooling_f: formData.refrigerant.subcooling_f,
            superheat_f: formData.refrigerant.superheat_f,
            drier_replaced: formData.refrigerant.drier_replaced,
            notes: formData.refrigerant.notes,
            risk_level: formData.refrigerant.leak_detected ? 'high' : 'low',
          });

        if (refError) {
          console.error('Error inserting refrigerant inspection:', refError);
        }
      }

      // 3. Insert oil analysis data
      if (formData.oil.sample_collected || formData.oil.current_level_pct !== null) {
        const { error: oilError } = await supabase
          .from('chiller_oil_analysis')
          .upsert({
            annual_pm_id: pmId,
            current_level_pct: formData.oil.current_level_pct,
            oil_type: formData.oil.oil_type,
            appearance: formData.oil.appearance,
            sample_collected: formData.oil.sample_collected,
            acid_number_mgkoh_g: formData.oil.acid_number_mgkoh_g,
            moisture_ppm: formData.oil.moisture_ppm,
            iron_ppm: formData.oil.iron_ppm,
            copper_ppm: formData.oil.copper_ppm,
            aluminum_ppm: formData.oil.aluminum_ppm,
            oil_changed: formData.oil.oil_changed,
            oil_filter_replaced: formData.oil.oil_filter_replaced,
            oil_heater_functional: formData.oil.oil_heater_functional,
            oil_pump_pressure_psig: formData.oil.oil_pump_pressure_psig,
            notes: formData.oil.notes,
            risk_level: (formData.oil.acid_number_mgkoh_g ?? 0) > 0.05 ? 'high' : 'low',
          });

        if (oilError) {
          console.error('Error inserting oil analysis:', oilError);
        }
      }

      // 4. Insert tube inspection data (evaporator and condenser)
      for (const bundleType of ['evaporator', 'condenser'] as const) {
        const tubeData = formData.tubes[bundleType];
        if (tubeData.tube_count_total !== null || tubeData.tubes_cleaned) {
          const { error: tubeError } = await supabase
            .from('chiller_tube_inspection')
            .upsert({
              annual_pm_id: pmId,
              bundle_type: bundleType,
              tube_count_total: tubeData.tube_count_total,
              tubes_plugged_total: tubeData.tubes_plugged_total,
              plugged_pct: tubeData.plugged_pct,
              test_method: tubeData.test_method,
              min_wall_thickness_mils: tubeData.min_wall_thickness_mils,
              avg_wall_thickness_mils: tubeData.avg_wall_thickness_mils,
              original_wall_thickness_mils: tubeData.original_wall_thickness_mils,
              wall_loss_pct: tubeData.wall_loss_pct,
              fouling_severity: tubeData.fouling_severity,
              tubes_cleaned: tubeData.tubes_cleaned,
              cleaning_method: tubeData.cleaning_method,
              waterbox_condition: tubeData.waterbox_condition,
              waterbox_gaskets_replaced: tubeData.waterbox_gaskets_replaced,
              sacrificial_anodes_replaced: tubeData.sacrificial_anodes_replaced,
              notes: tubeData.notes,
              risk_level: (tubeData.plugged_pct ?? 0) > 5 || (tubeData.wall_loss_pct ?? 0) > 20 ? 'high' : 'low',
            });

          if (tubeError) {
            console.error(`Error inserting ${bundleType} tube inspection:`, tubeError);
          }
        }
      }

      // 5. Insert water quality data
      const quality = formData.water.quality;
      if (quality.ph !== null || quality.legionella_detected !== null) {
        const { error: qualityError } = await supabase
          .from('chiller_water_quality')
          .upsert({
            annual_pm_id: pmId,
            water_loop: quality.water_loop || 'condenser_water',
            ph: quality.ph,
            conductivity_umhos: quality.conductivity_umhos,
            total_dissolved_solids_ppm: quality.total_dissolved_solids_ppm,
            legionella_detected: quality.legionella_detected,
            within_spec: quality.within_spec,
            treatment_vendor: quality.treatment_vendor,
            notes: quality.notes,
            risk_level: quality.legionella_detected ? 'critical' : 'low',
          });

        if (qualityError) {
          console.error('Error inserting water quality:', qualityError);
        }
      }

      // 6. Insert electrical check data
      for (const component of ['main_motor', 'oil_pump', 'vfd'] as const) {
        const elecData = formData.electrical[component];
        if (elecData && (elecData.voltage_l1_l2 !== null || elecData.insulation_resistance_megohms !== null)) {
          const { error: elecError } = await supabase
            .from('chiller_electrical_check')
            .upsert({
              annual_pm_id: pmId,
              component: component,
              voltage_l1_l2: elecData.voltage_l1_l2,
              voltage_l2_l3: elecData.voltage_l2_l3,
              voltage_l3_l1: elecData.voltage_l3_l1,
              voltage_imbalance_pct: elecData.voltage_imbalance_pct,
              amperage_l1: elecData.amperage_l1,
              amperage_l2: elecData.amperage_l2,
              amperage_l3: elecData.amperage_l3,
              insulation_resistance_megohms: elecData.insulation_resistance_megohms,
              vibration_acceptable: elecData.vibration_acceptable,
              starter_condition: elecData.starter_condition,
              notes: elecData.notes,
              risk_level: (elecData.voltage_imbalance_pct ?? 0) > 2 || 
                (elecData.insulation_resistance_megohms !== null && elecData.insulation_resistance_megohms < 1) 
                ? 'high' : 'low',
            });

          if (elecError) {
            console.error(`Error inserting ${component} electrical check:`, elecError);
          }
        }
      }

      // 7. Insert performance test data
      const perf = formData.performance;
      if (perf.test_date || perf.kw_input !== null || perf.tons_actual !== null) {
        const { error: perfError } = await supabase
          .from('chiller_performance_test')
          .upsert({
            annual_pm_id: pmId,
            test_date: perf.test_date,
            load_pct: perf.load_pct,
            chilled_water_supply_f: perf.chilled_water_supply_f,
            chilled_water_return_f: perf.chilled_water_return_f,
            condenser_water_supply_f: perf.condenser_water_supply_f,
            condenser_water_return_f: perf.condenser_water_return_f,
            chw_flow_gpm: perf.chw_flow_gpm,
            kw_input: perf.kw_input,
            tons_actual: perf.tons_actual,
            tons_design: perf.tons_design,
            kw_per_ton: perf.kw_per_ton,
            design_kw_per_ton: perf.design_kw_per_ton,
            notes: perf.notes,
          });

        if (perfError) {
          console.error('Error inserting performance test:', perfError);
        }
      }

      // 8. Insert findings
      for (const finding of formData.findings) {
        const { error: findingError } = await supabase
          .from('chiller_annual_findings')
          .upsert({
            annual_pm_id: pmId,
            issue_code: finding.issue_code,
            category: finding.category,
            description: finding.description,
            severity: finding.severity,
            recommended_action: finding.recommended_action,
            status: 'open',
          });

        if (findingError) {
          console.error('Error inserting finding:', findingError);
        }
      }

      // Mark draft as synced
      await chillerOfflineService.markDraftAsSynced(draftId);

      return { success: true, pmId };
    } catch (error) {
      console.error('Sync error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },
};

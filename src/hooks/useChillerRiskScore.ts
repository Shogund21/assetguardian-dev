// React hook for calculating chiller risk scores in real-time

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateChillerRiskScore,
  type RiskCalculationInput,
} from '@/services/chillerRiskCalculator';
import type { RiskCalculationResult } from '@/types/chillerRisk';
import type {
  AnnualChillerPMComplete,
  ChillerPerformanceTest,
  ChillerRefrigerantInspection,
} from '@/types/chillerAnnual';

interface UseChillerRiskScoreOptions {
  /** The complete PM data to calculate risk for */
  pmData?: AnnualChillerPMComplete | null;
  /** Equipment ID to fetch prior year data for YoY comparison */
  equipmentId?: string;
  /** Current inspection year */
  inspectionYear?: number;
  /** Whether to enable prior year data fetching */
  enablePriorYearFetch?: boolean;
}

interface UseChillerRiskScoreResult {
  /** The calculated risk result */
  riskResult: RiskCalculationResult | null;
  /** Whether prior year data is being loaded */
  isLoadingPriorYear: boolean;
  /** Error from prior year data fetch */
  priorYearError: Error | null;
  /** Prior year performance data (if available) */
  priorYearPerformance: ChillerPerformanceTest | null;
  /** Whether prior year had a leak detected */
  priorYearLeakDetected: boolean;
}

/**
 * Hook to calculate chiller risk score with YoY comparison data
 */
export function useChillerRiskScore(
  options: UseChillerRiskScoreOptions
): UseChillerRiskScoreResult {
  const {
    pmData,
    equipmentId,
    inspectionYear,
    enablePriorYearFetch = true,
  } = options;

  // Fetch prior year's annual PM for YoY comparison
  const {
    data: priorYearData,
    isLoading: isLoadingPriorYear,
    error: priorYearError,
  } = useQuery({
    queryKey: ['chiller-prior-year-pm', equipmentId, inspectionYear],
    queryFn: async () => {
      if (!equipmentId || !inspectionYear) return null;

      const priorYear = inspectionYear - 1;

      // Fetch prior year's annual PM
      const { data: priorPm, error: pmError } = await supabase
        .from('annual_chiller_pm')
        .select('id')
        .eq('equipment_id', equipmentId)
        .eq('inspection_year', priorYear)
        .maybeSingle();

      if (pmError) throw pmError;
      if (!priorPm) return null;

      // Fetch performance test and refrigerant inspection in parallel
      const [performanceResult, refrigerantResult] = await Promise.all([
        supabase
          .from('chiller_performance_test')
          .select('*')
          .eq('annual_pm_id', priorPm.id)
          .maybeSingle(),
        supabase
          .from('chiller_refrigerant_inspection')
          .select('leak_detected')
          .eq('annual_pm_id', priorPm.id)
          .maybeSingle(),
      ]);

      if (performanceResult.error) throw performanceResult.error;
      if (refrigerantResult.error) throw refrigerantResult.error;

      return {
        performance: performanceResult.data as ChillerPerformanceTest | null,
        leakDetected: refrigerantResult.data?.leak_detected ?? false,
      };
    },
    enabled: enablePriorYearFetch && !!equipmentId && !!inspectionYear,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate risk score
  const riskResult = useMemo(() => {
    if (!pmData) return null;

    const input: RiskCalculationInput = {
      pm: pmData,
      priorYearPerformance: priorYearData?.performance ?? null,
      priorYearLeakDetected: priorYearData?.leakDetected ?? false,
    };

    return calculateChillerRiskScore(input);
  }, [pmData, priorYearData]);

  return {
    riskResult,
    isLoadingPriorYear,
    priorYearError: priorYearError as Error | null,
    priorYearPerformance: priorYearData?.performance ?? null,
    priorYearLeakDetected: priorYearData?.leakDetected ?? false,
  };
}

/**
 * Standalone function to calculate risk from raw PM data
 * (for use without React context)
 */
export function calculateRiskFromPM(
  pm: AnnualChillerPMComplete,
  priorYearPerformance?: ChillerPerformanceTest | null,
  priorYearLeakDetected?: boolean
): RiskCalculationResult {
  return calculateChillerRiskScore({
    pm,
    priorYearPerformance: priorYearPerformance ?? null,
    priorYearLeakDetected: priorYearLeakDetected ?? false,
  });
}

/**
 * Hook to fetch and calculate risk for a specific PM by ID
 */
export function useChillerRiskScoreById(pmId: string | null | undefined) {
  // Fetch the complete PM data
  const {
    data: pmData,
    isLoading: isLoadingPm,
    error: pmError,
  } = useQuery({
    queryKey: ['chiller-pm-complete', pmId],
    queryFn: async () => {
      if (!pmId) return null;

      // Fetch main PM record
      const { data: pm, error } = await supabase
        .from('annual_chiller_pm')
        .select(`
          *,
          equipment:equipment_id (name, location, type)
        `)
        .eq('id', pmId)
        .single();

      if (error) throw error;

      // Fetch all child records in parallel
      const [
        refrigerantResult,
        oilResult,
        tubeResult,
        waterSideResult,
        waterQualityResult,
        electricalResult,
        performanceResult,
        findingsResult,
      ] = await Promise.all([
        supabase.from('chiller_refrigerant_inspection').select('*').eq('annual_pm_id', pmId).maybeSingle(),
        supabase.from('chiller_oil_analysis').select('*').eq('annual_pm_id', pmId).maybeSingle(),
        supabase.from('chiller_tube_inspection').select('*').eq('annual_pm_id', pmId),
        supabase.from('chiller_water_side_inspection').select('*').eq('annual_pm_id', pmId),
        supabase.from('chiller_water_quality').select('*').eq('annual_pm_id', pmId),
        supabase.from('chiller_electrical_check').select('*').eq('annual_pm_id', pmId),
        supabase.from('chiller_performance_test').select('*').eq('annual_pm_id', pmId).maybeSingle(),
        supabase.from('chiller_annual_findings').select('*').eq('annual_pm_id', pmId),
      ]);

      const completePm: AnnualChillerPMComplete = {
        ...pm,
        status: pm.status as AnnualChillerPMComplete['status'],
        ai_analysis_json: (pm.ai_analysis_json as Record<string, unknown>) ?? null,
        refrigerant_inspection: refrigerantResult.data ?? undefined,
        oil_analysis: oilResult.data ?? undefined,
        tube_inspections: tubeResult.data?.map(t => ({
          ...t,
          bundle_type: t.bundle_type as 'evaporator' | 'condenser',
          fouling_severity: t.fouling_severity as 'none' | 'light' | 'moderate' | 'heavy' | 'severe' | null,
        })) ?? undefined,
        water_side_inspections: waterSideResult.data?.map(w => ({
          ...w,
          water_loop: w.water_loop as 'chilled_water' | 'condenser_water',
        })) ?? undefined,
        water_quality_records: waterQualityResult.data?.map(wq => ({
          ...wq,
          water_loop: wq.water_loop as 'chilled_water' | 'condenser_water' | 'makeup',
        })) ?? undefined,
        electrical_checks: electricalResult.data?.map(ec => ({
          ...ec,
          component: ec.component as 'main_motor' | 'oil_pump' | 'purge' | 'controls' | 'vfd',
        })) ?? undefined,
        performance_test: performanceResult.data ?? undefined,
        findings: findingsResult.data?.map(f => ({
          ...f,
          status: f.status as 'open' | 'in_progress' | 'resolved' | 'deferred' | 'wont_fix',
        })) ?? undefined,
      };

      return completePm;
    },
    enabled: !!pmId,
  });

  // Use the risk score hook with the fetched data
  const riskScore = useChillerRiskScore({
    pmData: pmData,
    equipmentId: pmData?.equipment_id,
    inspectionYear: pmData?.inspection_year,
    enablePriorYearFetch: !!pmData,
  });

  return {
    pmData,
    isLoadingPm,
    pmError: pmError as Error | null,
    ...riskScore,
  };
}

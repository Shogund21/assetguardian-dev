import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import type { AnnualChillerPMComplete } from "@/types/chillerAnnual";

export interface CompletePMData {
  pm: AnnualChillerPMComplete;
  refrigerant: any | null;
  oil: any | null;
  tubeEvaporator: any | null;
  tubeCondenser: any | null;
  waterSideChilled: any | null;
  waterSideCondenser: any | null;
  waterQuality: any[];
  electrical: any[];
  performance: any | null;
  findings: any[];
}

async function fetchCompletePMData(pmId: string): Promise<CompletePMData | null> {
  // Fetch all data in parallel
  const [
    pmResult,
    refrigerantResult,
    oilResult,
    tubesResult,
    waterSideResult,
    waterQualityResult,
    electricalResult,
    performanceResult,
    findingsResult,
  ] = await Promise.all([
    supabase
      .from("annual_chiller_pm")
      .select(`
        *,
        equipment:equipment_id (name, location, type, model, serial_number),
        technician:technician_id (firstName:firstName, lastName:lastName)
      `)
      .eq("id", pmId)
      .single(),
    supabase
      .from("chiller_refrigerant_inspection")
      .select("*")
      .eq("annual_pm_id", pmId)
      .maybeSingle(),
    supabase
      .from("chiller_oil_analysis")
      .select("*")
      .eq("annual_pm_id", pmId)
      .maybeSingle(),
    supabase
      .from("chiller_tube_inspection")
      .select("*")
      .eq("annual_pm_id", pmId),
    supabase
      .from("chiller_water_side_inspection")
      .select("*")
      .eq("annual_pm_id", pmId),
    supabase
      .from("chiller_water_quality")
      .select("*")
      .eq("annual_pm_id", pmId),
    supabase
      .from("chiller_electrical_check")
      .select("*")
      .eq("annual_pm_id", pmId),
    supabase
      .from("chiller_performance_test")
      .select("*")
      .eq("annual_pm_id", pmId)
      .maybeSingle(),
    supabase
      .from("chiller_annual_findings")
      .select("*")
      .eq("annual_pm_id", pmId)
      .order("severity", { ascending: false }),
  ]);

  if (pmResult.error || !pmResult.data) {
    console.error("Error fetching PM:", pmResult.error);
    return null;
  }

  const tubes = tubesResult.data || [];
  const waterSide = waterSideResult.data || [];

  return {
    pm: pmResult.data as unknown as AnnualChillerPMComplete,
    refrigerant: refrigerantResult.data,
    oil: oilResult.data,
    tubeEvaporator: tubes.find((t: any) => t.bundle_type === "evaporator") || null,
    tubeCondenser: tubes.find((t: any) => t.bundle_type === "condenser") || null,
    waterSideChilled: waterSide.find((w: any) => w.water_loop === "chilled_water") || null,
    waterSideCondenser: waterSide.find((w: any) => w.water_loop === "condenser_water") || null,
    waterQuality: waterQualityResult.data || [],
    electrical: electricalResult.data || [],
    performance: performanceResult.data,
    findings: findingsResult.data || [],
  };
}

export function useChillerPMReport(pmId: string | null) {
  return useQuery({
    queryKey: ["chiller-pm-report", pmId],
    queryFn: () => (pmId ? fetchCompletePMData(pmId) : null),
    enabled: !!pmId,
  });
}

export function useCompletedChillerPMs() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ["completed-chiller-pms", currentCompany?.id],
    queryFn: async () => {
      let query = supabase
        .from("annual_chiller_pm")
        .select(`
          id,
          inspection_date,
          inspection_year,
          chiller_model,
          overall_risk_level,
          overall_risk_score,
          equipment:equipment_id (name, location)
        `)
        .eq("status", "completed")
        .order("inspection_date", { ascending: false });

      if (currentCompany?.id) {
        query = query.eq("company_id", currentCompany.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

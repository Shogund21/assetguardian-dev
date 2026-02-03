import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import type { ChillerFleetHealth, ChillerHealthScore } from "@/types/chillerDashboard";

export function useChillerFleetHealth() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ["chiller-fleet-health", currentCompany?.id],
    queryFn: async (): Promise<ChillerFleetHealth> => {
      // Get all chillers count
      let equipmentQuery = supabase
        .from("equipment")
        .select("id", { count: "exact" })
        .ilike("type", "%chiller%");
      
      if (currentCompany?.id) {
        equipmentQuery = equipmentQuery.eq("company_id", currentCompany.id);
      }
      
      const { count: totalChillers } = await equipmentQuery;

      // Get current year PMs with risk data
      const currentYear = new Date().getFullYear();
      let pmQuery = supabase
        .from("annual_chiller_pm")
        .select("overall_risk_score, overall_risk_level, next_annual_due")
        .gte("inspection_year", currentYear - 1);
      
      if (currentCompany?.id) {
        pmQuery = pmQuery.eq("company_id", currentCompany.id);
      }

      const { data: pmData } = await pmQuery;

      // Calculate metrics
      const riskScores = pmData?.filter(pm => pm.overall_risk_score !== null) || [];
      const avgScore = riskScores.length > 0 
        ? riskScores.reduce((sum, pm) => sum + (100 - (pm.overall_risk_score || 0)), 0) / riskScores.length
        : 0;

      const highRiskCount = pmData?.filter(
        pm => pm.overall_risk_level === "high" || pm.overall_risk_level === "critical"
      ).length || 0;

      // Find next inspection due
      const nextDue = pmData
        ?.filter(pm => pm.next_annual_due)
        .sort((a, b) => new Date(a.next_annual_due!).getTime() - new Date(b.next_annual_due!).getTime())
        [0]?.next_annual_due || null;

      return {
        totalChillers: totalChillers || 0,
        averageHealthScore: Math.round(avgScore),
        highRiskCount,
        noRedundancyRiskCount: 0, // Would need equipment metadata for has_backup
        nextInspectionDue: nextDue,
      };
    },
    enabled: true,
  });
}

export function useChillerHealthScores() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ["chiller-health-scores", currentCompany?.id],
    queryFn: async (): Promise<ChillerHealthScore[]> => {
      // Get latest PM for each equipment with prior year comparison
      let query = supabase
        .from("annual_chiller_pm")
        .select(`
          id,
          equipment_id,
          chiller_model,
          overall_risk_score,
          overall_risk_level,
          inspection_date,
          inspection_year,
          equipment:equipment_id (id, name, location, type)
        `)
        .order("inspection_year", { ascending: false });

      if (currentCompany?.id) {
        query = query.eq("company_id", currentCompany.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by equipment and calculate trends
      const equipmentMap = new Map<string, ChillerHealthScore>();
      const priorScores = new Map<string, number>();

      // Sort by year descending to get latest first
      const sorted = (data || []).sort((a, b) => b.inspection_year - a.inspection_year);

      for (const pm of sorted) {
        const equipmentId = pm.equipment_id;
        const equipment = pm.equipment as { id: string; name: string; location: string; type: string | null } | null;

        if (!equipment) continue;

        if (!equipmentMap.has(equipmentId)) {
          // This is the latest record for this equipment
          equipmentMap.set(equipmentId, {
            equipmentId,
            equipmentName: equipment.name,
            location: equipment.location || 'Unknown',
            model: pm.chiller_model,
            healthScore: 100 - (pm.overall_risk_score || 0),
            riskLevel: pm.overall_risk_level,
            lastInspection: pm.inspection_date,
            priorYearScore: null,
            trend: 'new',
          });
        } else {
          // This is a prior year record - use to calculate trend
          if (!priorScores.has(equipmentId)) {
            priorScores.set(equipmentId, 100 - (pm.overall_risk_score || 0));
          }
        }
      }

      // Apply trends
      for (const [equipmentId, score] of equipmentMap.entries()) {
        const priorScore = priorScores.get(equipmentId);
        if (priorScore !== undefined) {
          score.priorYearScore = priorScore;
          const diff = score.healthScore - priorScore;
          if (diff > 5) score.trend = 'improving';
          else if (diff < -5) score.trend = 'declining';
          else score.trend = 'stable';
        }
      }

      return Array.from(equipmentMap.values())
        .sort((a, b) => a.healthScore - b.healthScore); // Worst first
    },
    enabled: true,
  });
}

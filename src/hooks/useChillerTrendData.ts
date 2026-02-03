import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import type { 
  TubeLossTrendData, 
  RefrigerantTrendData, 
  LeakHeatmapCell,
  EfficiencyTrendData 
} from "@/types/chillerDashboard";

export function useTubeLossTrend() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ["chiller-tube-loss-trend", currentCompany?.id],
    queryFn: async (): Promise<TubeLossTrendData[]> => {
      let query = supabase
        .from("chiller_tube_inspection")
        .select(`
          id,
          bundle_type,
          plugged_pct,
          wall_loss_pct,
          annual_pm:annual_pm_id (
            inspection_year,
            equipment_id,
            company_id,
            equipment:equipment_id (name)
          )
        `);

      const { data, error } = await query;
      if (error) throw error;

      // Filter by company if set
      const filtered = (data || []).filter(item => {
        const pm = item.annual_pm as { company_id: string | null } | null;
        return !currentCompany?.id || pm?.company_id === currentCompany.id;
      });

      // Transform and aggregate by year/equipment
      const groupedData = new Map<string, TubeLossTrendData>();

      for (const item of filtered) {
        const pm = item.annual_pm as { 
          inspection_year: number; 
          equipment_id: string; 
          equipment: { name: string } | null 
        } | null;
        
        if (!pm) continue;
        
        const key = `${pm.equipment_id}-${pm.inspection_year}`;
        let record = groupedData.get(key);
        
        if (!record) {
          record = {
            year: pm.inspection_year,
            equipmentId: pm.equipment_id,
            equipmentName: pm.equipment?.name || 'Unknown',
            evaporatorPluggedPct: null,
            condenserPluggedPct: null,
            evaporatorWallLossPct: null,
            condenserWallLossPct: null,
          };
          groupedData.set(key, record);
        }

        if (item.bundle_type === 'evaporator') {
          record.evaporatorPluggedPct = item.plugged_pct;
          record.evaporatorWallLossPct = item.wall_loss_pct;
        } else if (item.bundle_type === 'condenser') {
          record.condenserPluggedPct = item.plugged_pct;
          record.condenserWallLossPct = item.wall_loss_pct;
        }
      }

      return Array.from(groupedData.values())
        .sort((a, b) => a.year - b.year || a.equipmentName.localeCompare(b.equipmentName));
    },
    enabled: true,
  });
}

export function useRefrigerantTrend() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ["chiller-refrigerant-trend", currentCompany?.id],
    queryFn: async (): Promise<RefrigerantTrendData[]> => {
      let query = supabase
        .from("chiller_refrigerant_inspection")
        .select(`
          id,
          added_amount_lbs,
          recovery_amount_lbs,
          leak_detected,
          leak_location_code,
          annual_pm:annual_pm_id (
            inspection_year,
            equipment_id,
            company_id,
            equipment:equipment_id (name)
          )
        `);

      const { data, error } = await query;
      if (error) throw error;

      const filtered = (data || []).filter(item => {
        const pm = item.annual_pm as { company_id: string | null } | null;
        return !currentCompany?.id || pm?.company_id === currentCompany.id;
      });

      return filtered.map(item => {
        const pm = item.annual_pm as { 
          inspection_year: number; 
          equipment_id: string; 
          equipment: { name: string } | null 
        };
        
        const added = item.added_amount_lbs || 0;
        const recovered = item.recovery_amount_lbs || 0;
        
        return {
          year: pm.inspection_year,
          equipmentId: pm.equipment_id,
          equipmentName: pm.equipment?.name || 'Unknown',
          addedLbs: added,
          recoveredLbs: recovered,
          netLossLbs: added - recovered,
          leakDetected: item.leak_detected || false,
          leakLocation: item.leak_location_code,
        };
      }).sort((a, b) => a.year - b.year);
    },
    enabled: true,
  });
}

export function useLeakHeatmap() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ["chiller-leak-heatmap", currentCompany?.id],
    queryFn: async (): Promise<LeakHeatmapCell[]> => {
      // Get leak locations reference data
      const { data: leakLocations } = await supabase
        .from("chiller_ref_leak_locations")
        .select("code, label")
        .eq("is_active", true);

      const locationLabels = new Map(
        (leakLocations || []).map(l => [l.code, l.label])
      );

      // Get inspection data
      let query = supabase
        .from("chiller_refrigerant_inspection")
        .select(`
          id,
          leak_detected,
          leak_location_code,
          annual_pm:annual_pm_id (
            company_id,
            equipment:equipment_id (location)
          )
        `);

      const { data, error } = await query;
      if (error) throw error;

      const filtered = (data || []).filter(item => {
        const pm = item.annual_pm as { company_id: string | null } | null;
        return !currentCompany?.id || pm?.company_id === currentCompany.id;
      });

      // Aggregate by location + leak location code
      const heatmapData = new Map<string, LeakHeatmapCell>();
      let maxCount = 0;

      for (const item of filtered) {
        const pm = item.annual_pm as { equipment: { location: string } | null };
        const location = pm?.equipment?.location || 'Unknown';
        const leakCode = item.leak_location_code || 'unknown';
        const key = `${location}-${leakCode}`;

        let cell = heatmapData.get(key);
        if (!cell) {
          cell = {
            location,
            leakLocationCode: leakCode,
            leakLocationLabel: locationLabels.get(leakCode) || leakCode,
            leakCount: 0,
            totalInspections: 0,
            intensity: 0,
          };
          heatmapData.set(key, cell);
        }

        cell.totalInspections++;
        if (item.leak_detected) {
          cell.leakCount++;
          maxCount = Math.max(maxCount, cell.leakCount);
        }
      }

      // Calculate intensity (normalized 0-1)
      for (const cell of heatmapData.values()) {
        cell.intensity = maxCount > 0 ? cell.leakCount / maxCount : 0;
      }

      return Array.from(heatmapData.values())
        .filter(cell => cell.leakCount > 0);
    },
    enabled: true,
  });
}

export function useEfficiencyTrend() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ["chiller-efficiency-trend", currentCompany?.id],
    queryFn: async (): Promise<EfficiencyTrendData[]> => {
      let query = supabase
        .from("chiller_performance_test")
        .select(`
          id,
          kw_per_ton,
          design_kw_per_ton,
          degradation_since_last_year_pct,
          load_pct,
          meets_design_efficiency,
          annual_pm:annual_pm_id (
            inspection_year,
            equipment_id,
            company_id,
            equipment:equipment_id (name)
          )
        `)
        .not("kw_per_ton", "is", null);

      const { data, error } = await query;
      if (error) throw error;

      const filtered = (data || []).filter(item => {
        const pm = item.annual_pm as { company_id: string | null } | null;
        return !currentCompany?.id || pm?.company_id === currentCompany.id;
      });

      return filtered.map(item => {
        const pm = item.annual_pm as { 
          inspection_year: number; 
          equipment_id: string; 
          equipment: { name: string } | null 
        };
        
        return {
          year: pm.inspection_year,
          equipmentId: pm.equipment_id,
          equipmentName: pm.equipment?.name || 'Unknown',
          kwPerTon: item.kw_per_ton,
          designKwPerTon: item.design_kw_per_ton,
          degradationPct: item.degradation_since_last_year_pct,
          loadPct: item.load_pct,
          meetsDesignEfficiency: item.meets_design_efficiency,
        };
      }).sort((a, b) => a.year - b.year);
    },
    enabled: true,
  });
}

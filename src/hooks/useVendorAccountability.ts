import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import type { VendorAccountability, HighRiskAsset } from "@/types/chillerDashboard";

export function useVendorAccountability() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ["chiller-vendor-accountability", currentCompany?.id],
    queryFn: async (): Promise<VendorAccountability[]> => {
      // Get all findings with PM info
      let query = supabase
        .from("chiller_annual_findings")
        .select(`
          id,
          status,
          category,
          estimated_cost,
          actual_cost,
          resolution_date,
          created_at,
          responsible_party,
          annual_pm:annual_pm_id (
            company_id,
            technician_id
          )
        `);

      const { data, error } = await query;
      if (error) throw error;

      const filtered = (data || []).filter(item => {
        const pm = item.annual_pm as { company_id: string | null } | null;
        return !currentCompany?.id || pm?.company_id === currentCompany.id;
      });

      // Get technician names separately
      const technicianIds = [...new Set(
        filtered
          .map(f => (f.annual_pm as { technician_id: string | null } | null)?.technician_id)
          .filter(Boolean)
      )];

      const { data: technicians } = technicianIds.length > 0 
        ? await supabase
            .from("technicians")
            .select("id, firstName, lastName")
            .in("id", technicianIds)
        : { data: [] };

      const technicianMap = new Map(
        (technicians || []).map(t => [t.id, `${t.firstName} ${t.lastName}`])
      );

      // Aggregate by vendor/technician
      const vendorMap = new Map<string, VendorAccountability>();

      for (const finding of filtered) {
        const pm = finding.annual_pm as { technician_id: string | null } | null;
        
        const vendorId = finding.responsible_party || pm?.technician_id || null;
        const vendorName = vendorId ? (technicianMap.get(vendorId) || 'Unknown') : 'Unassigned';

        let vendor = vendorMap.get(vendorName);
        if (!vendor) {
          vendor = {
            vendorId,
            vendorName,
            totalFindings: 0,
            findingsResolved: 0,
            findingsOpen: 0,
            avgResolutionDays: null,
            estimatedCostTotal: 0,
            actualCostTotal: 0,
            resolutionRate: 0,
            topCategories: [],
          };
          vendorMap.set(vendorName, vendor);
        }

        vendor.totalFindings++;
        
        if (finding.status === 'resolved') {
          vendor.findingsResolved++;
        } else if (finding.status === 'open' || finding.status === 'in_progress') {
          vendor.findingsOpen++;
        }

        vendor.estimatedCostTotal += finding.estimated_cost || 0;
        vendor.actualCostTotal += finding.actual_cost || 0;

        if (finding.category && !vendor.topCategories.includes(finding.category)) {
          vendor.topCategories.push(finding.category);
        }
      }

      // Calculate resolution rates
      for (const vendor of vendorMap.values()) {
        vendor.resolutionRate = vendor.totalFindings > 0 
          ? Math.round((vendor.findingsResolved / vendor.totalFindings) * 100)
          : 0;
        vendor.topCategories = vendor.topCategories.slice(0, 3);
      }

      return Array.from(vendorMap.values())
        .sort((a, b) => b.totalFindings - a.totalFindings);
    },
    enabled: true,
  });
}

export function useHighRiskAssets() {
  const { currentCompany } = useCompany();

  return useQuery({
    queryKey: ["chiller-high-risk-assets", currentCompany?.id],
    queryFn: async (): Promise<HighRiskAsset[]> => {
      const currentYear = new Date().getFullYear();
      
      // Get high-risk PMs from current year
      let pmQuery = supabase
        .from("annual_chiller_pm")
        .select(`
          id,
          equipment_id,
          chiller_model,
          overall_risk_score,
          overall_risk_level,
          inspection_date,
          equipment:equipment_id (id, name, location, type)
        `)
        .in("overall_risk_level", ["high", "critical"])
        .gte("inspection_year", currentYear - 1)
        .order("overall_risk_score", { ascending: false });

      if (currentCompany?.id) {
        pmQuery = pmQuery.eq("company_id", currentCompany.id);
      }

      const { data: pmData, error: pmError } = await pmQuery;
      if (pmError) throw pmError;

      // Get open findings count for each PM
      const pmIds = (pmData || []).map(pm => pm.id);
      
      let findingsQuery = supabase
        .from("chiller_annual_findings")
        .select("annual_pm_id, issue_code, estimated_cost")
        .in("annual_pm_id", pmIds)
        .in("status", ["open", "in_progress"]);

      const { data: findingsData } = await findingsQuery;

      // Group findings by PM
      const findingsByPm = new Map<string, { count: number; cost: number; codes: string[] }>();
      for (const finding of findingsData || []) {
        let group = findingsByPm.get(finding.annual_pm_id);
        if (!group) {
          group = { count: 0, cost: 0, codes: [] };
          findingsByPm.set(finding.annual_pm_id, group);
        }
        group.count++;
        group.cost += finding.estimated_cost || 0;
        if (finding.issue_code) group.codes.push(finding.issue_code);
      }

      return (pmData || []).map(pm => {
        const equipment = pm.equipment as { id: string; name: string; location: string; type: string | null } | null;
        const findings = findingsByPm.get(pm.id) || { count: 0, cost: 0, codes: [] };
        
        return {
          id: pm.id,
          equipmentId: pm.equipment_id,
          name: equipment?.name || 'Unknown',
          location: equipment?.location || 'Unknown',
          model: pm.chiller_model,
          riskScore: pm.overall_risk_score || 0,
          riskLevel: pm.overall_risk_level || 'unknown',
          redFlags: findings.codes,
          hasBackup: true, // Would need equipment metadata
          lastInspection: pm.inspection_date,
          estimatedRepairCost: findings.cost > 0 ? findings.cost : null,
          openFindingsCount: findings.count,
        };
      });
    },
    enabled: true,
  });
}

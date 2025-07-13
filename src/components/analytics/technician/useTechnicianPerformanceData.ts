
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAnalyticsFilters } from "../AnalyticsFilterContext";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";
import { BarChartDataItem } from "@/components/charts/BarChart";

interface TechnicianStats extends BarChartDataItem {
  name: string;
  completed: number;
  pending: number;
  issues: number;
  total: number;
}

export function useTechnicianPerformanceData() {
  const { dateRange } = useAnalyticsFilters();
  const { companyId } = useCompanyFilter();
  const [chartData, setChartData] = useState<TechnicianStats[]>([]);
  const isMobile = useIsMobile();

  // Fetch technicians for names
  const { data: technicians } = useQuery({
    queryKey: ['technicians', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('company_id', companyId);
      
      if (error) {
        console.error('Error fetching technicians:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!companyId
  });

  // Fetch maintenance checks
  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ['maintenance_checks_by_technician', companyId, dateRange],
    queryFn: async () => {
      if (!companyId) return [];
      
      let query = supabase
        .from('hvac_maintenance_checks')
        .select('*')
        .eq('company_id', companyId);
      
      if (dateRange.from) {
        query = query.gte('check_date', dateRange.from.toISOString());
      }
      
      if (dateRange.to) {
        query = query.lte('check_date', dateRange.to.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching maintenance checks:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!companyId
  });

  useEffect(() => {
    // Sample data that will be used when no data is available
    const sampleData = [
      { name: "Jorge Salazar", completed: 24, pending: 8, issues: 6, total: 38 },
      { name: "Jose Pizarro", completed: 19, pending: 6, issues: 2, total: 27 },
      { name: "Maria Rodriguez", completed: 15, pending: 4, issues: 1, total: 20 },
      { name: "Carlos Gomez", completed: 12, pending: 3, issues: 2, total: 17 },
      { name: "Ana Martinez", completed: 10, pending: 2, issues: 0, total: 12 }
    ];
    
    if (maintenanceData && technicians) {
      // Process real data if available
      try {
        // Create a lookup map for technician names
        const technicianMap = new Map();
        technicians.forEach(tech => {
          technicianMap.set(tech.id, `${tech.firstName} ${tech.lastName}`);
        });
        
        // Group maintenance checks by technician
        const techPerformance: Record<string, { completed: number; pending: number; issues: number }> = {};
        
        maintenanceData.forEach(check => {
          if (!check.technician_id) return;
          
          const techId = check.technician_id;
          if (!techPerformance[techId]) {
            techPerformance[techId] = { completed: 0, pending: 0, issues: 0 };
          }
          
          if (check.status === 'completed') {
            techPerformance[techId].completed += 1;
          } else if (check.status === 'pending') {
            techPerformance[techId].pending += 1;
          } else if (check.status === 'issue_found') {
            techPerformance[techId].issues += 1;
          }
        });
        
        // Format for chart - convert to array, add names, and sort by completed tasks (not total)
        const formattedData = Object.entries(techPerformance)
          .map(([techId, stats]) => ({
            name: technicianMap.get(techId) || 'Unknown Technician',
            ...stats,
            total: stats.completed + stats.pending + stats.issues
          }))
          .sort((a, b) => b.completed - a.completed) // Sort by completed tasks, not total
          .slice(0, 5); // Always show top 5 regardless of screen size
        
        if (formattedData.length > 0) {
          setChartData(formattedData);
        } else {
          setChartData(sampleData);
        }
      } catch (error) {
        console.error("Error processing technician data:", error);
        setChartData(sampleData);
      }
    } else {
      // Always use sample data if no real data is available
      setChartData(sampleData);
    }
  }, [maintenanceData, technicians, isMobile]);

  return { chartData, isLoading };
}


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

  // Fetch technicians using the proper function that handles RLS
  const { data: technicians } = useQuery({
    queryKey: ['technicians_with_roles', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase.rpc('get_technicians_with_roles');
      
      if (error) {
        console.error('Error fetching technicians:', error);
        throw error;
      }
      
      // Filter by company_id since the function returns all technicians
      return (data || []).filter(tech => tech.company_id === companyId);
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
    console.log('Processing technician performance data:', {
      technicianCount: technicians?.length || 0,
      maintenanceDataCount: maintenanceData?.length || 0,
      companyId,
      dateRange
    });

    // Sample data that will be used when no data is available
    const sampleData = [
      { name: "Jorge Salazar", completed: 24, pending: 8, issues: 6, total: 38 },
      { name: "Jose Pizarro", completed: 19, pending: 6, issues: 2, total: 27 },
      { name: "Maria Rodriguez", completed: 15, pending: 4, issues: 1, total: 20 },
      { name: "Carlos Gomez", completed: 12, pending: 3, issues: 2, total: 17 },
      { name: "Ana Martinez", completed: 10, pending: 2, issues: 0, total: 12 }
    ];
    
    if (technicians && technicians.length > 0) {
      console.log('Available technicians:', technicians.map(t => ({ id: t.id, name: `${t.firstName} ${t.lastName}` })));
      
      // Create a lookup map for technician names
      const technicianMap = new Map();
      technicians.forEach(tech => {
        technicianMap.set(tech.id, `${tech.firstName} ${tech.lastName}`);
      });
      
      // Initialize performance data for all technicians
      const techPerformance: Record<string, { completed: number; pending: number; issues: number }> = {};
      technicians.forEach(tech => {
        techPerformance[tech.id] = { completed: 0, pending: 0, issues: 0 };
      });
      
      // Process maintenance data if available
      if (maintenanceData && maintenanceData.length > 0) {
        console.log('Processing maintenance checks:', maintenanceData.length);
        
        maintenanceData.forEach(check => {
          console.log('Processing check:', {
            id: check.id,
            technician_id: check.technician_id,
            status: check.status,
            check_date: check.check_date
          });
          
          if (!check.technician_id) return;
          
          const techId = check.technician_id;
          if (!techPerformance[techId]) {
            console.log(`Technician ${techId} not found in company technicians, skipping`);
            return;
          }
          
          // Handle all possible status values
          if (check.status === 'completed') {
            techPerformance[techId].completed += 1;
          } else if (check.status === 'pending') {
            techPerformance[techId].pending += 1;
          } else if (check.status === 'issue_found') {
            techPerformance[techId].issues += 1;
          } else {
            console.log(`Unknown status: ${check.status}, treating as pending`);
            techPerformance[techId].pending += 1;
          }
        });
      } else {
        console.log('No maintenance data available');
      }
      
      // Format for chart - convert to array, add names, and sort by total tasks
      const formattedData = Object.entries(techPerformance)
        .map(([techId, stats]) => ({
          name: technicianMap.get(techId) || 'Unknown Technician',
          ...stats,
          total: stats.completed + stats.pending + stats.issues
        }))
        .filter(tech => tech.total > 0 || technicians.length <= 5) // Show all if few technicians, or only those with tasks
        .sort((a, b) => b.total - a.total) // Sort by total tasks
        .slice(0, 5); // Always show top 5
      
      console.log('Final formatted data:', formattedData);
      
      if (formattedData.length > 0) {
        setChartData(formattedData);
      } else {
        console.log('No performance data available, using sample data');
        setChartData(sampleData);
      }
    } else {
      console.log('No technicians available, using sample data');
      setChartData(sampleData);
    }
  }, [maintenanceData, technicians, companyId, dateRange]);

  return { chartData, isLoading };
}

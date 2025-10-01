
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FilterChange } from "@/types/filterChanges";
import { calculateFilterStatus } from "@/utils/filterStatusCalculator";

export function useFilterChangesQuery(options?: { equipmentId?: string; enabled?: boolean }) {
  const { toast } = useToast();
  const { equipmentId, enabled = true } = options || {};

  return useQuery({
    queryKey: ['filter-changes', equipmentId],
    enabled,
    queryFn: async () => {
      // Query filter_changes directly where status = 'active' instead of using view
      let query = supabase
        .from('filter_changes')
        .select(`
          *,
          equipment:equipment_id (
            name,
            location
          ),
          technician:technician_id (
            firstName,
            lastName
          )
        `)
        .eq('status', 'active')
        .order('due_date', { ascending: true });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching filter changes:", error);
        toast({
          title: "Error fetching filter changes",
          description: "Please try again later.",
          variant: "destructive",
        });
        throw error;
      }

      // Add calculated status_calc to each item (replaces view's status_calc column)
      const dataWithStatus = (data || []).map(item => ({
        ...item,
        status_calc: calculateFilterStatus(item.due_date)
      }));

      return dataWithStatus as FilterChange[];
    },
  });
}

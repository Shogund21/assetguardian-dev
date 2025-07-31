
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FilterChange, FilterChangeFormValues } from "@/types/filterChanges";

export function useFilterChangeMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const create = useMutation({
    mutationFn: async (values: FilterChangeFormValues) => {
      const { data, error } = await supabase
        .from('filter_changes')
        .insert([{
          equipment_id: values.equipment_id,
          location_id: values.location_id,
          filter_type: values.filter_type,
          filter_size: values.filter_size,
          installation_date: values.installation_date.toISOString(),
          due_date: values.due_date.toISOString(),
          technician_id: values.technician_id,
          status: values.status,
          filter_condition: values.filter_condition,
          notes: values.notes,
        }])
        .select();

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-changes'] });
      toast({
        title: "Filter change added",
        description: "Filter change has been added successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating filter change:", error);
      toast({
        title: "Error adding filter change",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const update = useMutation({
    mutationFn: async (data: { id: string, values: Partial<FilterChangeFormValues> }) => {
      const { id, values } = data;

      // Format dates if they exist
      const formattedValues: Record<string, any> = {};
      
      // Copy all non-date values
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'installation_date' && key !== 'due_date') {
          formattedValues[key] = value;
        }
      });
      
      // Handle dates separately
      if (values.installation_date instanceof Date) {
        formattedValues.installation_date = values.installation_date.toISOString();
      }
      
      if (values.due_date instanceof Date) {
        formattedValues.due_date = values.due_date.toISOString();
      }

      const { data: updatedData, error } = await supabase
        .from('filter_changes')
        .update(formattedValues)
        .eq('id', id)
        .select();

      if (error) throw error;
      return updatedData?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-changes'] });
      toast({
        title: "Filter change updated",
        description: "Filter change has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating filter change:", error);
      toast({
        title: "Error updating filter change",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('filter_changes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-changes'] });
      toast({
        title: "Filter change deleted",
        description: "Filter change has been deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting filter change:", error);
      toast({
        title: "Error deleting filter change",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const completeFilterChange = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('filter_changes')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-changes'] });
      toast({
        title: "Filter change completed",
        description: "Filter change has been marked as completed",
      });
    },
    onError: (error) => {
      console.error("Error completing filter change:", error);
      toast({
        title: "Error completing filter change",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  return { create, update, remove, completeFilterChange };
}

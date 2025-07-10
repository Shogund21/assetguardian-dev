import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEquipmentStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (equipmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase.rpc('set_equipment_status', {
        p_equipment_id: equipmentId,
        p_status: newStatus
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      toast({
        title: "Success",
        description: `Equipment status has been updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update equipment status",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: maintenanceDeleteError } = await supabase
        .from('hvac_maintenance_checks')
        .delete()
        .eq('equipment_id', id);

      if (maintenanceDeleteError) {
        console.error('Error deleting maintenance checks:', maintenanceDeleteError);
        throw maintenanceDeleteError;
      }

      const { error: equipmentDeleteError } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (equipmentDeleteError) throw equipmentDeleteError;

      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      toast({
        title: "Success",
        description: "Equipment and associated maintenance checks deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete equipment. Please try again.",
      });
    }
  };

  return {
    handleStatusChange,
    handleDelete,
  };
};
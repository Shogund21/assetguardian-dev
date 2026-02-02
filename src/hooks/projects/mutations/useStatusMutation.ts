import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useStatusMutation = (refetch: () => Promise<any>) => {
  const { toast } = useToast();

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      console.log("Updating project status:", { projectId, newStatus });
      
      const { error } = await supabase.rpc('set_project_status', {
        p_project_id: projectId,
        p_status: newStatus
      });

      if (error) {
        console.error("Error updating project status:", error);
        throw error;
      }

      await refetch();

      toast({
        title: "Success",
        description: "Project status updated successfully",
      });
    } catch (error) {
      console.error("Error updating project status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project status. Please try again.",
      });
    }
  };

  return { handleStatusChange };
};

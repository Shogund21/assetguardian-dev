import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePriorityMutation = (refetch: () => Promise<any>) => {
  const { toast } = useToast();

  const handlePriorityChange = async (projectId: string, newPriority: string) => {
    try {
      console.log("Updating project priority:", { projectId, newPriority });
      
      const { error } = await supabase.rpc('set_project_priority', {
        p_project_id: projectId,
        p_priority: newPriority
      });

      if (error) {
        console.error("Error updating project priority:", error);
        throw error;
      }

      await refetch();

      toast({
        title: "Success",
        description: "Project priority updated successfully",
      });
    } catch (error) {
      console.error("Error updating project priority:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project priority. Please try again.",
      });
    }
  };

  return { handlePriorityChange };
};

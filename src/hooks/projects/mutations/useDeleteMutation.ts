import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { useState } from "react";

export const useDeleteMutation = (
  projects: Project[],
  setProjects: (projects: Project[]) => void
) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (projectId: string) => {
    if (isDeleting) return; // Prevent multiple clicks
    
    setIsDeleting(true);
    
    try {
      console.log("Attempting to delete project:", projectId);
      
      const { data, error } = await supabase.rpc('delete_project', {
        p_project_id: projectId
      });

      if (error) {
        console.error("RPC error:", error);
        throw error;
      }

      console.log("Delete response:", data);

      // Type assertion for the JSON response
      const response = data as { success: boolean; error?: string; message?: string; code?: string };

      if (!response?.success) {
        const errorMessage = response?.error || "Failed to delete project";
        console.error("Delete failed:", errorMessage);
        
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: errorMessage,
        });
        return;
      }

      // Only update local state if deletion was successful
      setProjects(projects.filter(project => project.id !== projectId));

      toast({
        title: "Success",
        description: response.message || "Project deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return { handleDelete, isDeleting };
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { useAuth } from "@/hooks/useAuth";
import { useProjectMutations } from "./projects/useProjectMutations";

export const useProjects = () => {
  const { isAuthenticated } = useAuth();

  const { data: projects = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("createdat", { ascending: false });
      if (error) throw error;
      return (data || []) as Project[];
    },
    enabled: isAuthenticated,
  });

  const { handleStatusChange, handlePriorityChange, handleDelete, isDeleting } = 
    useProjectMutations(refetch);

  return { 
    projects, 
    loading, 
    handleStatusChange, 
    handlePriorityChange, 
    handleDelete, 
    isDeleting, 
    refetch 
  };
};

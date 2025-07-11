import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { useProjectMutations } from "./projects/useProjectMutations";
import { useProjectsQuery } from "./projects/useProjectsQuery";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { fetchProjects } = useProjectsQuery();
  const { 
    handleStatusChange, 
    handlePriorityChange, 
    handleDelete,
    isDeleting
  } = useProjectMutations(projects, setProjects);

  useEffect(() => {
    const loadProjects = async () => {
      const data = await fetchProjects();
      setProjects(data);
      setLoading(false);
    };

    loadProjects();
  }, []);

  return {
    projects,
    loading,
    handleStatusChange,
    handlePriorityChange,
    handleDelete,
    isDeleting
  };
};
import { Project } from "@/types/project";
import { useStatusMutation } from "./mutations/useStatusMutation";
import { usePriorityMutation } from "./mutations/usePriorityMutation";
import { useDeleteMutation } from "./mutations/useDeleteMutation";

export const useProjectMutations = (
  projects: Project[], 
  setProjects: (projects: Project[]) => void
) => {
  const { handleStatusChange } = useStatusMutation(projects, setProjects);
  const { handlePriorityChange } = usePriorityMutation(projects, setProjects);
  const { handleDelete, isDeleting } = useDeleteMutation(projects, setProjects);

  return {
    handleStatusChange,
    handlePriorityChange,
    handleDelete,
    isDeleting
  };
};
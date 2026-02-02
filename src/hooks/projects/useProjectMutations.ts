import { useStatusMutation } from "./mutations/useStatusMutation";
import { usePriorityMutation } from "./mutations/usePriorityMutation";
import { useDeleteMutation } from "./mutations/useDeleteMutation";

export const useProjectMutations = (
  refetch: () => Promise<any>
) => {
  const { handleStatusChange } = useStatusMutation(refetch);
  const { handlePriorityChange } = usePriorityMutation(refetch);
  const { handleDelete, isDeleting } = useDeleteMutation(refetch);

  return {
    handleStatusChange,
    handlePriorityChange,
    handleDelete,
    isDeleting
  };
};


import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

const FormActions = ({ isLoading, isEdit, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button 
        type="submit"
        className="bg-[#1EAEDB] hover:bg-[#33C3F0] text-black"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
            {isEdit ? "Updating..." : "Adding..."}
          </>
        ) : (
          isEdit ? "Update Equipment" : "Add Equipment"
        )}
      </Button>
    </div>
  );
};

export default FormActions;

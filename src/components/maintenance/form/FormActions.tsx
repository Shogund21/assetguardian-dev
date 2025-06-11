
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
  onSubmit?: () => void;
}

const FormActions = ({ 
  onCancel, 
  isEditing = false, 
  isSubmitting = false,
  onSubmit
}: FormActionsProps) => {
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    console.log('Submit button clicked, onSubmit handler exists:', !!onSubmit);
    if (onSubmit) {
      onSubmit();
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white pb-4 px-2 z-10 shadow-md">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="bg-blue-900 hover:bg-blue-800 text-white border-blue-900"
      >
        Cancel
      </Button>
      
      <Button 
        type={onSubmit ? "button" : "submit"}
        onClick={onSubmit ? handleClick : undefined}
        className={`${isMobile ? 'w-full' : ''} bg-blue-900 hover:bg-blue-800 text-white text-base font-medium`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>{isEditing ? 'Updating...' : 'Saving...'}</span>
          </div>
        ) : (
          isEditing ? 'Update Maintenance Check' : 'Submit Maintenance Check'
        )}
      </Button>
    </div>
  );
};

export default FormActions;

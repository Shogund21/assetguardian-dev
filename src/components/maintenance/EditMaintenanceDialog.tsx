
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MaintenanceCheckForm from "./MaintenanceCheckForm";
import { MaintenanceCheck } from "@/types/maintenance";
import { useState } from "react";

interface EditMaintenanceDialogProps {
  check: MaintenanceCheck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const EditMaintenanceDialog = ({
  check,
  open,
  onOpenChange,
  onComplete
}: EditMaintenanceDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log the check data being passed to the form
  console.log('EditMaintenanceDialog - Initial check data:', check);

  const handleComplete = () => {
    console.log('EditMaintenanceDialog - Handling completion');
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isSubmitting) {
        console.log('Preventing dialog close during submission');
        return; // Prevent closing during submission
      }
      console.log('Dialog open state changing to:', newOpen);
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Maintenance Check</DialogTitle>
          <DialogDescription>
            Update the maintenance check details and readings below.
          </DialogDescription>
        </DialogHeader>
        <MaintenanceCheckForm 
          onComplete={handleComplete} 
          initialData={check}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditMaintenanceDialog;


import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, X } from "lucide-react";
import FilterChangeFormDialog from "@/components/filter/FilterChangeFormDialog";

interface FilterChangePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId: string;
  equipmentName: string;
  maintenanceData: {
    air_filter_cleaned?: boolean;
    fan_belt_condition?: string;
    air_filter_status?: string;
    belt_condition?: string;
  };
  onComplete: () => void;
}

const FilterChangePromptDialog = ({
  open,
  onOpenChange,
  equipmentId,
  equipmentName,
  maintenanceData,
  onComplete
}: FilterChangePromptDialogProps) => {
  const [showFilterForm, setShowFilterForm] = useState(false);

  const handleCreateFilterChange = () => {
    setShowFilterForm(true);
  };

  const handleSkip = () => {
    onOpenChange(false);
    onComplete();
  };

  const handleFilterFormComplete = () => {
    setShowFilterForm(false);
    onOpenChange(false);
    onComplete();
  };

  const shouldPromptForFilter = 
    maintenanceData.air_filter_cleaned === true ||
    maintenanceData.air_filter_status === 'needs_replacement' ||
    maintenanceData.air_filter_status === 'clean';

  const shouldPromptForBelt = 
    maintenanceData.fan_belt_condition === 'needs_replacement' ||
    maintenanceData.belt_condition === 'needs_replacement';

  if (!shouldPromptForFilter && !shouldPromptForBelt) {
    return null;
  }

  return (
    <>
      <Dialog open={open && !showFilterForm} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Filter Maintenance Detected
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                Your maintenance check for <strong>{equipmentName}</strong> indicates filter-related work:
              </p>
              
              <ul className="text-sm text-blue-700 space-y-1">
                {shouldPromptForFilter && (
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    Filter cleaned or replaced
                  </li>
                )}
                {shouldPromptForBelt && (
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    Belt needs replacement
                  </li>
                )}
              </ul>
            </div>

            <p className="text-sm text-gray-600">
              Would you like to create a filter change record to track this maintenance?
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreateFilterChange}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Filter Record
              </Button>
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Skip for Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FilterChangeFormDialog
        open={showFilterForm}
        onOpenChange={setShowFilterForm}
        equipmentId={equipmentId}
        onComplete={handleFilterFormComplete}
      />
    </>
  );
};

export default FilterChangePromptDialog;

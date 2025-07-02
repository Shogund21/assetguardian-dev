import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { SensorReading } from "@/types/predictive";

interface DeleteReadingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  reading: SensorReading | null;
  isDeleting: boolean;
}

export const DeleteReadingDialog = ({
  isOpen,
  onClose,
  onConfirm,
  reading,
  isDeleting
}: DeleteReadingDialogProps) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!reading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Reading
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The reading will be permanently deleted 
            and removed from all analysis calculations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reading Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Reading Details:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{reading.sensor_type}</span>
              </div>
              <div>
                <span className="text-gray-600">Value:</span>
                <span className="ml-2 font-medium">{reading.value} {reading.unit}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Timestamp:</span>
                <span className="ml-2 font-medium">
                  {new Date(reading.timestamp_utc).toLocaleString()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Source:</span>
                <span className="ml-2 font-medium capitalize">{reading.source || 'manual'}</span>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="delete-reason">
              Reason for Deletion <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="delete-reason"
              placeholder="e.g., Incorrect reading due to sensor malfunction, duplicate entry, data entry error..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-gray-600">
              This reason will be logged for compliance and audit purposes.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              "Deleting..."
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Reading
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
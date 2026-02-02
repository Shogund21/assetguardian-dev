import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SkipReason, SkipReasonCode, WizardStep, SKIP_REASON_OPTIONS } from '@/types/chillerWizard';

interface SkipReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: WizardStep;
  stepTitle: string;
  onConfirm: (reason: SkipReason) => void;
}

export function SkipReasonDialog({
  open,
  onOpenChange,
  step,
  stepTitle,
  onConfirm,
}: SkipReasonDialogProps) {
  const [selectedReason, setSelectedReason] = useState<SkipReasonCode | null>(null);
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (!selectedReason) return;

    onConfirm({
      step,
      reasonCode: selectedReason,
      notes: selectedReason === 'other' ? notes : undefined,
    });

    // Reset state
    setSelectedReason(null);
    setNotes('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedReason(null);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skip {stepTitle}?</DialogTitle>
          <DialogDescription>
            Please select a reason for skipping this section. This will be recorded in the inspection report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={selectedReason || ''}
            onValueChange={(value) => setSelectedReason(value as SkipReasonCode)}
          >
            {SKIP_REASON_OPTIONS.map((option) => (
              <div key={option.code} className="flex items-center space-x-3">
                <RadioGroupItem value={option.code} id={option.code} />
                <Label htmlFor={option.code} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedReason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="skip-notes">Please specify:</Label>
              <Textarea
                id="skip-notes"
                placeholder="Enter reason for skipping..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === 'other' && !notes.trim())}
          >
            Skip Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

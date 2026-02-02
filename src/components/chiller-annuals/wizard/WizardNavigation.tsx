import { ChevronLeft, ChevronRight, SkipForward, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WizardStep } from '@/types/chillerWizard';

interface WizardNavigationProps {
  currentStep: WizardStep;
  canProceed: boolean;
  canSkip: boolean;
  isSaving?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onSubmit?: () => void;
  nextLabel?: string;
  className?: string;
}

export function WizardNavigation({
  currentStep,
  canProceed,
  canSkip,
  isSaving = false,
  isFirstStep = false,
  isLastStep = false,
  onBack,
  onNext,
  onSkip,
  onSubmit,
  nextLabel,
  className,
}: WizardNavigationProps) {
  return (
    <div className={cn('flex items-center gap-2 p-4 border-t bg-background', className)}>
      {/* Back button */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onBack}
        disabled={isFirstStep || isSaving}
        className="flex-shrink-0"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Back</span>
      </Button>

      {/* Skip button (only for skippable steps) */}
      {canSkip && !isLastStep && (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onSkip}
          disabled={isSaving}
          className="flex-shrink-0 text-muted-foreground"
        >
          <SkipForward className="h-4 w-4 mr-1" />
          Skip
        </Button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Save className="h-4 w-4 animate-pulse" />
          <span className="hidden sm:inline">Saving...</span>
        </div>
      )}

      {/* Next/Submit button */}
      {isLastStep ? (
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={!canProceed || isSaving}
          className="flex-shrink-0 min-w-[120px]"
        >
          Submit
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      ) : (
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          disabled={!canProceed || isSaving}
          className="flex-shrink-0 min-w-[100px]"
        >
          {nextLabel || 'Next'}
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      )}
    </div>
  );
}

// Sticky bottom navigation for mobile
export function WizardNavigationSticky(props: WizardNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <WizardNavigation {...props} />
    </div>
  );
}

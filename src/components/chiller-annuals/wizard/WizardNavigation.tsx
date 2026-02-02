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
      {/* Back button - 48px minimum touch target */}
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isSaving}
        className="h-12 px-4 shrink-0 active:scale-95 touch-manipulation"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Back</span>
      </Button>

      {/* Skip button (only for skippable steps) */}
      {canSkip && !isLastStep && (
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          disabled={isSaving}
          className="h-12 px-3 shrink-0 text-muted-foreground active:scale-95 touch-manipulation"
        >
          <SkipForward className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Skip</span>
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

      {/* Next/Submit button - larger touch target */}
      {isLastStep ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed || isSaving}
          className="h-12 px-6 min-w-[100px] text-base font-semibold active:scale-95 touch-manipulation"
        >
          Submit
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isSaving}
          className="h-12 px-6 min-w-[90px] text-base font-semibold active:scale-95 touch-manipulation"
        >
          {nextLabel || 'Next'}
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      )}
    </div>
  );
}

// Sticky bottom navigation for mobile with safe area padding
export function WizardNavigationSticky(props: WizardNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]">
      <WizardNavigation {...props} />
    </div>
  );
}

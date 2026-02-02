import { cn } from '@/lib/utils';
import { Check, SkipForward } from 'lucide-react';
import { WizardStep, WizardStepInfo } from '@/types/chillerWizard';

interface WizardProgressProps {
  currentStep: WizardStep;
  steps: WizardStepInfo[];
  onStepClick?: (step: WizardStep) => void;
  className?: string;
}

export function WizardProgress({
  currentStep,
  steps,
  onStepClick,
  className,
}: WizardProgressProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Step indicator text */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStep} of {steps.length}
        </span>
        <span className="font-medium">
          {steps.find(s => s.step === currentStep)?.title}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1">
        {steps.map((step, index) => {
          const isActive = step.step === currentStep;
          const isPast = step.step < currentStep;
          const isClickable = onStepClick && (isPast || step.isCompleted || step.isSkipped);

          return (
            <button
              key={step.step}
              type="button"
              onClick={() => isClickable && onStepClick?.(step.step)}
              disabled={!isClickable}
              className={cn(
                'relative flex-1 h-2 rounded-full transition-all',
                isActive && 'bg-primary',
                isPast && step.isCompleted && 'bg-primary',
                isPast && step.isSkipped && 'bg-muted-foreground/50',
                !isActive && !isPast && 'bg-muted',
                isClickable && 'cursor-pointer hover:opacity-80',
                !isClickable && 'cursor-default'
              )}
              title={`${step.title}${step.isSkipped ? ' (Skipped)' : ''}`}
            >
              {/* Completion/Skip indicator */}
              {(step.isCompleted || step.isSkipped) && step.step !== currentStep && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full">
                  {step.isSkipped ? (
                    <SkipForward className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for mobile header
export function WizardProgressCompact({
  currentStep,
  totalSteps,
  title,
  className,
}: {
  currentStep: WizardStep;
  totalSteps: number;
  title: string;
  className?: string;
}) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Step {currentStep}/{totalSteps}</span>
        <span className="font-medium text-foreground truncate ml-2">{title}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

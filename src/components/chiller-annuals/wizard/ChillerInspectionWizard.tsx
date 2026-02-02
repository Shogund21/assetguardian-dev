import { useState } from 'react';
import { ArrowLeft, WifiOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardProgressCompact } from './WizardProgress';
import { WizardNavigationSticky } from './WizardNavigation';
import { SkipReasonDialog } from './SkipReasonDialog';
import { Step1AssetSelection } from './steps/Step1AssetSelection';
import { Step2Refrigerant } from './steps/Step2Refrigerant';
import { Step3OilSystem } from './steps/Step3OilSystem';
import { Step4TubeInspection } from './steps/Step4TubeInspection';
import { Step5WaterSystem } from './steps/Step5WaterSystem';
import { useChillerWizardForm } from '@/hooks/useChillerWizardForm';
import { WIZARD_STEPS, WizardStep, SkipReason } from '@/types/chillerWizard';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ChillerInspectionWizardProps {
  draftId?: string;
  onComplete?: () => void;
}

export function ChillerInspectionWizard({ draftId, onComplete }: ChillerInspectionWizardProps) {
  const navigate = useNavigate();
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [isOnline] = useState(navigator.onLine);

  const {
    formData,
    currentStep,
    isLoading,
    isSaving,
    updateFormData,
    updateRefrigerant,
    updateOil,
    updateTubes,
    updateWater,
    updateWaterQuality,
    updateElectrical,
    updatePerformance,
    nextStep,
    prevStep,
    skipStep,
    validateStep,
    canProceed,
    getStepStatus,
    saveDraft,
  } = useChillerWizardForm({ draftId });

  const currentStepInfo = WIZARD_STEPS.find(s => s.step === currentStep)!;
  const errors = validateStep(currentStep);

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/chiller-annuals');
    } else {
      prevStep();
    }
  };

  const handleNext = () => {
    if (canProceed(currentStep)) {
      nextStep();
    }
  };

  const handleSkip = () => {
    setShowSkipDialog(true);
  };

  const handleSkipConfirm = (reason: SkipReason) => {
    skipStep(reason);
    setShowSkipDialog(false);
  };

  const handleSubmit = async () => {
    await saveDraft();
    onComplete?.();
    navigate('/chiller-annuals');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1AssetSelection
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 2:
        return (
          <Step2Refrigerant
            formData={formData}
            updateRefrigerant={updateRefrigerant}
            errors={errors}
          />
        );
      case 3:
        return (
          <Step3OilSystem
            formData={formData}
            updateOil={updateOil}
          />
        );
      case 4:
        return (
          <Step4TubeInspection
            formData={formData}
            updateTubes={updateTubes}
          />
        );
      case 5:
        return (
          <Step5WaterSystem
            formData={formData}
            updateWater={updateWater}
            updateWaterQuality={updateWaterQuality}
          />
        );
      case 6:
      case 7:
      case 8:
      case 9:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Step {currentStep} - Coming soon
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3 safe-area-top">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">Annual Chiller Inspection</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <WifiOff className="h-4 w-4 text-amber-500" />
            )}
            {isSaving && (
              <Save className="h-4 w-4 text-muted-foreground animate-pulse" />
            )}
          </div>
        </div>
        
        {/* Progress */}
        <div className="mt-3">
          <WizardProgressCompact
            currentStep={currentStep}
            totalSteps={9}
            title={currentStepInfo.title}
          />
        </div>
      </header>

      {/* Content - with bottom padding for sticky nav */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-[calc(80px+env(safe-area-inset-bottom))]">
        {renderStep()}
      </main>

      {/* Navigation */}
      <WizardNavigationSticky
        currentStep={currentStep}
        canProceed={canProceed(currentStep) || currentStepInfo.canSkip}
        canSkip={currentStepInfo.canSkip}
        isSaving={isSaving}
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === 9}
        onBack={handleBack}
        onNext={handleNext}
        onSkip={handleSkip}
        onSubmit={handleSubmit}
      />

      {/* Skip Dialog */}
      <SkipReasonDialog
        open={showSkipDialog}
        onOpenChange={setShowSkipDialog}
        step={currentStep}
        stepTitle={currentStepInfo.title}
        onConfirm={handleSkipConfirm}
      />
    </div>
  );
}

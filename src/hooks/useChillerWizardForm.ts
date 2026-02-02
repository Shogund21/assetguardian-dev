import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ChillerWizardFormData, 
  WizardStep, 
  SkipReason,
  getInitialWizardFormData,
  WIZARD_STEPS 
} from '@/types/chillerWizard';
import { chillerOfflineService } from '@/services/chillerOfflineService';
import { calculateVoltageImbalance, calculatePluggedPct } from '@/services/chillerRiskCalculator';

interface UseChillerWizardFormOptions {
  draftId?: string;
  onAutoSave?: () => void;
}

export function useChillerWizardForm(options: UseChillerWizardFormOptions = {}) {
  const { draftId: initialDraftId, onAutoSave } = options;
  
  const [draftId, setDraftId] = useState<string>(initialDraftId || crypto.randomUUID());
  const [formData, setFormData] = useState<ChillerWizardFormData>(getInitialWizardFormData());
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Load existing draft on mount
  useEffect(() => {
    if (initialDraftId) {
      loadDraft(initialDraftId);
    }
  }, [initialDraftId]);

  // Auto-save with debounce
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(async () => {
      await saveDraft();
      onAutoSave?.();
    }, 2000); // 2 second debounce
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, hasUnsavedChanges]);

  const loadDraft = async (id: string) => {
    setIsLoading(true);
    try {
      const draft = await chillerOfflineService.getDraft(id);
      if (draft) {
        setFormData(draft.form_data);
        setCurrentStep(draft.current_step as WizardStep);
        setDraftId(draft.id);
        lastSavedDataRef.current = JSON.stringify(draft.form_data);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = async () => {
    const currentDataString = JSON.stringify(formData);
    if (currentDataString === lastSavedDataRef.current) return;
    
    setIsSaving(true);
    try {
      await chillerOfflineService.saveDraft(draftId, formData, currentStep);
      lastSavedDataRef.current = currentDataString;
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Form update helpers
  const updateFormData = useCallback(<K extends keyof ChillerWizardFormData>(
    key: K,
    value: ChillerWizardFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const updateRefrigerant = useCallback((
    field: keyof ChillerWizardFormData['refrigerant'],
    value: ChillerWizardFormData['refrigerant'][keyof ChillerWizardFormData['refrigerant']]
  ) => {
    setFormData(prev => ({
      ...prev,
      refrigerant: { ...prev.refrigerant, [field]: value },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateOil = useCallback((
    field: keyof ChillerWizardFormData['oil'],
    value: ChillerWizardFormData['oil'][keyof ChillerWizardFormData['oil']]
  ) => {
    setFormData(prev => ({
      ...prev,
      oil: { ...prev.oil, [field]: value },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateTubes = useCallback((
    bundleType: 'evaporator' | 'condenser',
    field: string,
    value: unknown
  ) => {
    setFormData(prev => {
      const newTubeData = { ...prev.tubes[bundleType], [field]: value };
      
      // Auto-calculate plugged percentage
      if (field === 'tubes_plugged_total' || field === 'tube_count_total') {
        newTubeData.plugged_pct = calculatePluggedPct(
          newTubeData.tubes_plugged_total ?? 0,
          newTubeData.tube_count_total ?? 0
        );
      }
      
      // Auto-calculate wall loss percentage
      if (field === 'min_wall_thickness_mils' || field === 'original_wall_thickness_mils') {
        const original = newTubeData.original_wall_thickness_mils;
        const min = newTubeData.min_wall_thickness_mils;
        if (original && min && original > 0) {
          newTubeData.wall_loss_pct = ((original - min) / original) * 100;
        }
      }
      
      return {
        ...prev,
        tubes: { ...prev.tubes, [bundleType]: newTubeData },
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const updateWater = useCallback((
    loopType: 'chilled_water' | 'condenser_water',
    field: string,
    value: unknown
  ) => {
    setFormData(prev => {
      const newWaterData = { ...prev.water[loopType], [field]: value };
      
      // Auto-calculate delta T
      if (field === 'entering_water_temp_f' || field === 'leaving_water_temp_f') {
        const entering = newWaterData.entering_water_temp_f;
        const leaving = newWaterData.leaving_water_temp_f;
        if (entering !== null && leaving !== null) {
          newWaterData.delta_t_f = Math.abs(leaving - entering);
        }
      }
      
      return {
        ...prev,
        water: { ...prev.water, [loopType]: newWaterData },
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const updateWaterQuality = useCallback((
    field: keyof ChillerWizardFormData['water']['quality'],
    value: unknown
  ) => {
    setFormData(prev => ({
      ...prev,
      water: {
        ...prev.water,
        quality: { ...prev.water.quality, [field]: value },
      },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateElectrical = useCallback((
    component: 'main_motor' | 'oil_pump' | 'vfd',
    field: string,
    value: unknown
  ) => {
    setFormData(prev => {
      const currentData = prev.electrical[component] || {
        voltage_l1_l2: null,
        voltage_l2_l3: null,
        voltage_l3_l1: null,
        voltage_imbalance_pct: null,
        amperage_l1: null,
        amperage_l2: null,
        amperage_l3: null,
        insulation_resistance_megohms: null,
        vibration_acceptable: null,
        starter_condition: null,
        notes: null,
      };
      
      const newElecData = { ...currentData, [field]: value };
      
      // Auto-calculate voltage imbalance
      if (field.startsWith('voltage_l')) {
        const v1 = newElecData.voltage_l1_l2;
        const v2 = newElecData.voltage_l2_l3;
        const v3 = newElecData.voltage_l3_l1;
        if (v1 !== null && v2 !== null && v3 !== null) {
          newElecData.voltage_imbalance_pct = calculateVoltageImbalance(v1, v2, v3);
        }
      }
      
      return {
        ...prev,
        electrical: { ...prev.electrical, [component]: newElecData },
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const updatePerformance = useCallback((
    field: keyof ChillerWizardFormData['performance'],
    value: unknown
  ) => {
    setFormData(prev => {
      const newPerfData = { ...prev.performance, [field]: value };
      
      // Auto-calculate tons and kW/ton
      if (
        field === 'chw_flow_gpm' ||
        field === 'chilled_water_supply_f' ||
        field === 'chilled_water_return_f' ||
        field === 'kw_input' ||
        field === 'tons_actual'
      ) {
        const flow = newPerfData.chw_flow_gpm;
        const supply = newPerfData.chilled_water_supply_f;
        const returnTemp = newPerfData.chilled_water_return_f;
        
        // Calculate tons if we have flow and temps
        if (flow && supply !== null && returnTemp !== null && !newPerfData.tons_actual) {
          const deltaT = Math.abs(returnTemp - supply);
          newPerfData.tons_actual = flow * deltaT * 0.04165;
        }
        
        // Calculate kW/ton
        const kw = newPerfData.kw_input;
        const tons = newPerfData.tons_actual;
        if (kw && tons && tons > 0) {
          newPerfData.kw_per_ton = kw / tons;
        }
      }
      
      return {
        ...prev,
        performance: newPerfData,
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Navigation
  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
    saveDraft(); // Save when navigating
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 9) {
      const newStep = (currentStep + 1) as WizardStep;
      
      // Mark current step as completed if not skipped
      if (!formData.skipReasons[currentStep]) {
        setFormData(prev => ({
          ...prev,
          completedSteps: [...new Set([...prev.completedSteps, currentStep])],
        }));
      }
      
      setCurrentStep(newStep);
      saveDraft();
    }
  }, [currentStep, formData.skipReasons]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
      saveDraft();
    }
  }, [currentStep]);

  const skipStep = useCallback((reason: SkipReason) => {
    setFormData(prev => ({
      ...prev,
      skipReasons: { ...prev.skipReasons, [currentStep]: reason },
    }));
    nextStep();
  }, [currentStep, nextStep]);

  // Validation
  const validateStep = useCallback((step: WizardStep): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!formData.equipment_id) errors.push('Please select a chiller');
        if (!formData.technician_id) errors.push('Please select a technician');
        if (!formData.inspection_date) errors.push('Please select an inspection date');
        break;
      case 2:
        if (formData.refrigerant.leak_detected === null) {
          errors.push('Please indicate if a leak was detected');
        }
        if (formData.refrigerant.leak_detected && !formData.refrigerant.leak_location_code) {
          errors.push('Please specify the leak location');
        }
        break;
      // Other steps have optional fields
    }
    
    return errors;
  }, [formData]);

  const canProceed = useCallback((step: WizardStep): boolean => {
    return validateStep(step).length === 0;
  }, [validateStep]);

  // Get step status
  const getStepStatus = useCallback((step: WizardStep) => {
    const baseStep = WIZARD_STEPS.find(s => s.step === step)!;
    return {
      ...baseStep,
      isCompleted: formData.completedSteps.includes(step),
      isSkipped: !!formData.skipReasons[step],
      skipReason: formData.skipReasons[step],
    };
  }, [formData.completedSteps, formData.skipReasons]);

  // Reset form
  const resetForm = useCallback(() => {
    const newDraftId = crypto.randomUUID();
    setDraftId(newDraftId);
    setFormData(getInitialWizardFormData());
    setCurrentStep(1);
    setHasUnsavedChanges(false);
    lastSavedDataRef.current = '';
  }, []);

  return {
    // State
    draftId,
    formData,
    currentStep,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    
    // Actions
    updateFormData,
    updateRefrigerant,
    updateOil,
    updateTubes,
    updateWater,
    updateWaterQuality,
    updateElectrical,
    updatePerformance,
    setFormData,
    
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    skipStep,
    
    // Validation
    validateStep,
    canProceed,
    getStepStatus,
    
    // Draft management
    saveDraft,
    loadDraft,
    resetForm,
  };
}

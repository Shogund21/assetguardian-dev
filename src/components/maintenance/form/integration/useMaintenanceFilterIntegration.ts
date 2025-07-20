
import { useState, useCallback } from "react";

interface MaintenanceData {
  air_filter_cleaned?: boolean;
  fan_belt_condition?: string;
  air_filter_status?: string;
  belt_condition?: string;
  equipment_id?: string;
  equipment_name?: string;
}

export const useMaintenanceFilterIntegration = () => {
  const [showFilterPrompt, setShowFilterPrompt] = useState(false);
  const [promptData, setPromptData] = useState<{
    equipmentId: string;
    equipmentName: string;
    maintenanceData: MaintenanceData;
  } | null>(null);

  const checkForFilterActions = useCallback((
    equipmentId: string,
    equipmentName: string,
    maintenanceData: MaintenanceData
  ) => {
    if (!equipmentId || !equipmentName || !maintenanceData) {
      return false;
    }

    const hasFilterAction = 
      maintenanceData.air_filter_cleaned === true ||
      maintenanceData.air_filter_status === 'needs_replacement' ||
      maintenanceData.air_filter_status === 'clean' ||
      maintenanceData.fan_belt_condition === 'needs_replacement' ||
      maintenanceData.belt_condition === 'needs_replacement';

    if (hasFilterAction) {
      setPromptData({
        equipmentId,
        equipmentName,
        maintenanceData
      });
      setShowFilterPrompt(true);
      return true;
    }

    return false;
  }, []);

  const handlePromptComplete = useCallback(() => {
    setShowFilterPrompt(false);
    setPromptData(null);
  }, []);

  const handlePromptClose = useCallback((open: boolean) => {
    if (!open) {
      setShowFilterPrompt(false);
      setPromptData(null);
    }
  }, []);

  return {
    showFilterPrompt,
    promptData,
    checkForFilterActions,
    handlePromptComplete,
    handlePromptClose
  };
};


import { useState, useEffect } from "react";
import { PredictiveMaintenanceService } from "@/services/predictiveMaintenanceService";
import { PredictiveAlert } from "@/types/predictive";
import { useToast } from "@/hooks/use-toast";

interface UseEquipmentAlertsProps {
  equipmentId?: string;
}

export const useEquipmentAlerts = ({ equipmentId }: UseEquipmentAlertsProps) => {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await PredictiveMaintenanceService.getActivePredictiveAlerts();
      // Filter by equipmentId if provided
      const filteredAlerts = equipmentId 
        ? data.filter(alert => alert.asset_id === equipmentId)
        : data;
      setAlerts(filteredAlerts || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error loading alerts",
        description: "Failed to load predictive maintenance alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [equipmentId]);

  return {
    alerts,
    loading,
    loadAlerts
  };
};

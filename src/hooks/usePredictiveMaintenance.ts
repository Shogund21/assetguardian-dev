
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PredictiveMaintenanceService } from '@/services/predictiveMaintenanceService';
import { PredictiveAlert, SensorReading } from '@/types/predictive';
import { useToast } from '@/hooks/use-toast';

export const usePredictiveMaintenance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for active predictive alerts
  const {
    data: alerts,
    isLoading: alertsLoading,
    error: alertsError
  } = useQuery({
    queryKey: ['predictive-alerts'],
    queryFn: PredictiveMaintenanceService.getActivePredictiveAlerts,
    refetchInterval: 60000, // Refresh every minute
  });

  // Mutation for running AI analysis
  const analyzeEquipment = useMutation({
    mutationFn: (equipmentId: string) => 
      PredictiveMaintenanceService.processAIAnalysis(equipmentId),
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Analysis Complete",
          description: `Risk level: ${data.risk_level}`,
        });
        queryClient.invalidateQueries({ queryKey: ['predictive-alerts'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to run predictive analysis",
        variant: "destructive",
      });
    },
  });

  // Query for sensor readings
  const useSensorReadings = (equipmentId: string, hours: number = 24) => {
    return useQuery({
      queryKey: ['sensor-readings', equipmentId, hours],
      queryFn: () => PredictiveMaintenanceService.getRecentSensorReadings(equipmentId, hours),
      enabled: !!equipmentId,
    });
  };

  // Mutation for storing sensor readings
  const storeSensorReading = useMutation({
    mutationFn: PredictiveMaintenanceService.storeSensorReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensor-readings'] });
    },
  });

  return {
    // Data
    alerts: alerts || [],
    alertsLoading,
    alertsError,
    
    // Actions
    analyzeEquipment: analyzeEquipment.mutate,
    isAnalyzing: analyzeEquipment.isPending,
    storeSensorReading: storeSensorReading.mutate,
    
    // Hooks
    useSensorReadings,
  };
};

export default usePredictiveMaintenance;

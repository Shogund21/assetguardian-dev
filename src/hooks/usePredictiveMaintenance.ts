
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PredictiveMaintenanceService } from '@/services/predictiveMaintenanceService';
import { EnhancedPredictiveService, ReadingSource } from '@/services/enhancedPredictiveService';
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

  // Mutation for running AI analysis with reading source preference
  const analyzeEquipment = useMutation({
    mutationFn: ({ equipmentId, readingSource }: { equipmentId: string; readingSource?: ReadingSource }) => 
      EnhancedPredictiveService.processEnhancedAIAnalysis(equipmentId, readingSource || 'auto'),
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

  // Query for reading counts to show in the selector
  const useReadingCounts = (equipmentId: string) => {
    return useQuery({
      queryKey: ['reading-counts', equipmentId],
      queryFn: async () => {
        const [manualReadings, maintenanceChecks] = await Promise.all([
          PredictiveMaintenanceService.getRecentSensorReadings(equipmentId, 168), // 7 days
          EnhancedPredictiveService.getMaintenanceHistoryWithFrequency(equipmentId)
        ]);
        
        return {
          manual: manualReadings.length,
          standard: maintenanceChecks.length
        };
      },
      enabled: !!equipmentId,
    });
  };

  // Mutation for storing sensor readings
  const storeSensorReading = useMutation({
    mutationFn: PredictiveMaintenanceService.storeSensorReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensor-readings'] });
      queryClient.invalidateQueries({ queryKey: ['reading-counts'] });
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
    useReadingCounts,
  };
};

export default usePredictiveMaintenance;

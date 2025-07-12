
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PredictiveMaintenanceService } from '@/services/predictiveMaintenanceService';
import { EnhancedPredictiveService, ReadingSource } from '@/services/enhancedPredictiveService';
import { equipmentDataIntegrityService } from '@/services/equipmentDataIntegrityService';
import { ImageAnalysisService } from '@/services/imageAnalysisService';
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

  // Enhanced query for reading counts with improved equipment matching
  const useReadingCounts = (equipmentId: string) => {
    return useQuery({
      queryKey: ['reading-counts', equipmentId],
      queryFn: async () => {
        console.log('Fetching reading counts for equipment ID:', equipmentId);
        
        // Use the improved data integrity service
        const counts = await equipmentDataIntegrityService.getReadingCountsWithFuzzyMatching(equipmentId);
        
        console.log('Reading counts result:', counts);
        return counts;
      },
      enabled: !!equipmentId,
      staleTime: 30000, // Cache for 30 seconds to reduce API calls
    });
  };

  // Query for data integrity check
  const useDataIntegrityCheck = () => {
    return useQuery({
      queryKey: ['data-integrity-check'],
      queryFn: equipmentDataIntegrityService.findNamingInconsistencies,
      staleTime: 300000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
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

  // Query for user's image analysis batches
  const useImageAnalysisBatches = (limit: number = 10) => {
    return useQuery({
      queryKey: ['image-analysis-batches', limit],
      queryFn: () => ImageAnalysisService.getUserBatches(limit),
      staleTime: 60000, // Cache for 1 minute
    });
  };

  // Mutation for saving staged readings
  const saveStagedReadings = useMutation({
    mutationFn: ImageAnalysisService.saveStagedReadings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensor-readings'] });
      queryClient.invalidateQueries({ queryKey: ['reading-counts'] });
      queryClient.invalidateQueries({ queryKey: ['image-analysis-batches'] });
      queryClient.invalidateQueries({ queryKey: ['predictive-alerts'] });
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
    saveStagedReadings: saveStagedReadings.mutate,
    isSavingStagedReadings: saveStagedReadings.isPending,
    
    // Hooks
    useSensorReadings,
    useReadingCounts,
    useDataIntegrityCheck,
    useImageAnalysisBatches,
  };
};

export default usePredictiveMaintenance;
